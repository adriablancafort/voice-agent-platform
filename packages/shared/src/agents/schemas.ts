import { z } from "zod"

import { agentConfigSchema } from "../agent-config/schemas"

export const agentNameSchema = z
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

export const createAgentInputSchema = z.object({
  name: agentNameSchema,
  draftConfig: agentConfigSchema,
})

export const updateAgentInputSchema = z.object({
  name: agentNameSchema,
  draftConfig: agentConfigSchema,
})

export const publishAgentInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})
