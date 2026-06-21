import type { z } from "zod"

import type { AgentConfig } from "../agent-config/types"
import type {
  createAgentInputSchema,
  publishAgentInputSchema,
  updateAgentInputSchema,
} from "./schemas"

export type AgentListItem = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  phoneNumbers: Array<{ number: string }>
}

export type AgentDraft = {
  id: string
  name: string
  draftConfig: AgentConfig
  createdAt: Date
  updatedAt: Date
}

type AgentVersionBase = {
  id: string
  number: number
  name: string | null
  description: string | null
  publishedAt: Date
  createdAt: Date
}

export type AgentVersionSummary = AgentVersionBase

export type AgentVersionsList = AgentVersionSummary[]

export type AgentVersionDetail = AgentVersionBase & {
  config: AgentConfig
}

export type AgentDetail = AgentDraft & {
  versions: AgentVersionSummary[]
}

export type DuplicateAgentResponse = AgentDraft

export type DeleteAgentResponse = {
  id: string
}

export type CreateAgentInput = z.infer<typeof createAgentInputSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentInputSchema>
export type PublishAgentInput = z.infer<typeof publishAgentInputSchema>
