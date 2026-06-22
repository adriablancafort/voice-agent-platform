import type { z } from "zod"

import type { AgentConfig } from "@workspace/shared/agent-config/types"
import type {
  createAgentRequestSchema,
  publishAgentRequestSchema,
  updateAgentRequestSchema,
} from "./schemas"

export type CreateAgentRequest = z.infer<typeof createAgentRequestSchema>
export type UpdateAgentRequest = z.infer<typeof updateAgentRequestSchema>
export type PublishAgentRequest = z.infer<typeof publishAgentRequestSchema>

export type AgentDraftResponse = {
  id: string
  name: string
  draftConfig: AgentConfig
  createdAt: Date
  updatedAt: Date
}

export type AgentVersionSummaryResponse = {
  id: string
  number: number
  name: string | null
  description: string | null
  publishedAt: Date
  createdAt: Date
}

export type AgentListResponse = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  phoneNumbers: { number: string }[]
}[]

export type AgentDetailResponse = AgentDraftResponse & {
  versions: AgentVersionSummaryResponse[]
}

export type AgentVersionsListResponse = AgentVersionSummaryResponse[]

export type AgentVersionDetailResponse = AgentVersionSummaryResponse & {
  config: AgentConfig
}

export type DuplicateAgentResponse = AgentDraftResponse
export type DeleteAgentResponse = { id: string }
