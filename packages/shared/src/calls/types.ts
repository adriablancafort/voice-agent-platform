import type { z } from "zod"

import type { AgentConfig } from "../agent-config/types"
import type {
  completeCallInputSchema,
  startPhoneCallInputSchema,
  startWebCallInputSchema,
} from "./schemas"

export type StartWebCallInput = z.infer<typeof startWebCallInputSchema>
export type StartPhoneCallInput = z.infer<typeof startPhoneCallInputSchema>
export type CompleteCallInput = z.infer<typeof completeCallInputSchema>

export type StartCallResponse = {
  callId: string
  config: AgentConfig
}

export type CompleteCallResponse = {
  id: string
  durationMs: number
}
