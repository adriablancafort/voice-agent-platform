import type { z } from "zod"

import type { AgentConfig } from "@workspace/shared/api/agent-config/types"
import type {
  createAgentRequestSchema,
  publishAgentRequestSchema,
  updateAgentConfigRequestSchema,
  updateAgentNameRequestSchema,
} from "./schemas"

export type CreateAgentRequest = z.infer<typeof createAgentRequestSchema>
export type UpdateAgentNameRequest = z.infer<
  typeof updateAgentNameRequestSchema
>
export type UpdateAgentConfigRequest = z.infer<
  typeof updateAgentConfigRequestSchema
>
export type PublishAgentRequest = z.infer<typeof publishAgentRequestSchema>

export type AgentResponse = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type AgentVersionResponse = {
  id: string
  number: number
  name: string | null
  description: string | null
  publishedAt: Date
  createdAt: Date
}

export type AgentConfigResponse = AgentConfig
export type AgentVersionConfigResponse = AgentConfig

export type AgentDetailResponse = AgentResponse & {
  versions: AgentVersionResponse[]
}

export type AgentsListItem = AgentResponse & {
  phoneNumbers: { number: string }[]
}

export type AgentsListResponse = AgentsListItem[]

export type AgentVersionsListResponse = AgentVersionResponse[]

export type CreateAgentResponse = AgentResponse
export type UpdateAgentNameResponse = AgentResponse
export type DuplicateAgentResponse = AgentResponse
export type DeleteAgentResponse = { id: string }
