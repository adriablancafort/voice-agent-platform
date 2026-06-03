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

import type { TurnDetectionConfig } from "@workspace/shared/agent-config/types"
import type { AgentConfigInput } from "@workspace/shared/agents/types"
import { FlowAgent } from "@/flow/agent"
import { buildFlowGraph } from "@/flow/builder"
import { loadAgentConfig } from "@/flow/loader"
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
    const agentId = participant.attributes?.agent_id

    if (!agentId) {
      throw new Error("agent_id is required")
    }

    const resolveInput: AgentConfigInput = {
      agentId,
    }

    const agentConfig = await loadAgentConfig(resolveInput)
    const flowGraph = buildFlowGraph(agentConfig)

    const session = new voice.AgentSession({
      stt: new inference.STT(agentConfig.stt),
      llm: new inference.LLM(agentConfig.llm),
      tts: new inference.TTS(agentConfig.tts),
      vad: ctx.proc.userData.vad,
      turnDetection: createTurnDetection(agentConfig.turnDetection),
    })

    await session.start({
      agent: new FlowAgent(flowGraph),
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
    apiKey: env.LIVEKIT_API_KEY,
    apiSecret: env.LIVEKIT_API_SECRET,
    wsURL: env.LIVEKIT_URL,
  })
)
