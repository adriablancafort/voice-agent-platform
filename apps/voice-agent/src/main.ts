import { fileURLToPath } from "node:url"
import {
  cli,
  defineAgent,
  inference,
  ServerOptions,
  voice,
} from "@livekit/agents"
import { audioEnhancement, EnhancerModel } from "@livekit/plugins-ai-coustics"

import { FlowAgent } from "@/flow/agent"
import { buildFlowGraph } from "@/flow/builder"
import { createVariables } from "@/flow/variables"
import { completeCall, parseDispatchMetadata, startCall } from "@/lib/calls"
import { env } from "@/lib/env"
import { buildCallTranscript } from "@/lib/transcript"

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect()

    const metadata = parseDispatchMetadata(ctx.job.metadata)
    const participant = await ctx.waitForParticipant()
    const livekitRoomName = ctx.room.name ?? ""

    const { callId, config } = await startCall(
      participant.attributes,
      metadata,
      livekitRoomName
    )

    const flowGraph = buildFlowGraph(config)
    const variables = createVariables(participant.attributes)

    const session = new voice.AgentSession({
      stt: new inference.STT(config.stt),
      llm: new inference.LLM(config.llm),
      tts: new inference.TTS(config.tts),
      turnHandling: {
        turnDetection: new inference.TurnDetector(),
        interruption: { mode: "adaptive" },
      },
    })

    ctx.room.on("participantDisconnected", (remoteParticipant) => {
      if (remoteParticipant.identity === participant.identity) {
        completeCall(
          callId,
          "completed",
          buildCallTranscript(session.history),
          variables.snapshot()
        )
      }
    })

    await session.start({
      agent: new FlowAgent(flowGraph, variables),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: audioEnhancement({ model: EnhancerModel.QuailVfS }),
      },
      record: false,
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
