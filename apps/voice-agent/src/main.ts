import { fileURLToPath } from "node:url"
import {
  cli,
  defineAgent,
  inference,
  ServerOptions,
  voice,
} from "@livekit/agents"
import * as livekit from "@livekit/agents-plugin-livekit"
import * as silero from "@livekit/agents-plugin-silero"
import { audioEnhancement } from "@livekit/plugins-ai-coustics"

import type { TurnDetectionConfig } from "@workspace/shared/api/agent-config/types"
import { FlowAgent } from "@/flow/agent"
import { buildFlowGraph } from "@/flow/builder"
import { createVariables } from "@/flow/variables"
import { completeCall, startCall } from "@/lib/calls"
import { env } from "@/lib/env"

interface ProcessUserData {
  vad: silero.VAD
}

function createTurnDetection(config: TurnDetectionConfig) {
  switch (config.model) {
    case "multilingual":
      return new livekit.turnDetector.MultilingualModel()
    case "english":
      return new livekit.turnDetector.EnglishModel()
  }
}

export default defineAgent<ProcessUserData>({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load()
  },
  entry: async (ctx) => {
    await ctx.connect()
    const participant = await ctx.waitForParticipant()
    const livekitRoomName = ctx.room.name ?? ""

    const { callId, config } = await startCall(
      participant.attributes,
      livekitRoomName
    )

    const flowGraph = buildFlowGraph(config)
    const variables = createVariables(participant.attributes)

    const session = new voice.AgentSession({
      stt: new inference.STT(config.stt),
      llm: new inference.LLM(config.llm),
      tts: new inference.TTS(config.tts),
      vad: ctx.proc.userData.vad,
      turnDetection: createTurnDetection(config.turnDetection),
    })

    ctx.room.on("participantDisconnected", (remoteParticipant) => {
      if (remoteParticipant.identity === participant.identity) {
        completeCall(callId)
      }
    })

    await session.start({
      agent: new FlowAgent(flowGraph, variables),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: audioEnhancement({ model: "quailVfS" }),
      },
    })
  },
})

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: env.LIVEKIT_AGENT_NAME,
    apiKey: env.LIVEKIT_API_KEY,
    apiSecret: env.LIVEKIT_API_SECRET,
    wsURL: env.LIVEKIT_URL,
  })
)
