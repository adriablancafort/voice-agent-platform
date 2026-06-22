import { z } from "zod"

import { agentConfigSchema } from "@workspace/shared/agent-config/schemas"

const agentNameSchema = z
  .string()
  .trim()
  .min(1, "Agent name is required")
  .max(64, "Agent name must be at most 64 characters")

export const agentIdParamsSchema = z.object({
  id: z.uuid(),
})

export const agentVersionParamsSchema = z.object({
  id: z.uuid(),
  number: z.coerce.number().int().positive(),
})

export const createAgentRequestSchema = z.object({
  name: agentNameSchema,
  draftConfig: agentConfigSchema,
})

export const updateAgentRequestSchema = z.object({
  name: agentNameSchema,
  draftConfig: agentConfigSchema,
})

export const publishAgentRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})
