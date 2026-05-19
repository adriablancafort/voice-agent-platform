import { z } from "zod"
import { agentConfigSchema } from "../agent-config/schemas"

export const agentNameSchema = z
  .string()
  .trim()
  .min(3, "Agent name must be at least 3 characters")
  .max(64, "Agent name must be at most 64 characters")

export const agentIdParamsSchema = z.object({
  id: z.uuid(),
})

export const agentVersionParamsSchema = z.object({
  id: z.uuid(),
  number: z.coerce.number().int().positive(),
})

export const createAgentFormSchema = z.object({
  name: agentNameSchema,
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
  name: agentNameSchema.optional(),
  description: z.string().trim().min(1).optional(),
})

export const publishAgentFormSchema = z.object({
  name: z.union([agentNameSchema, z.literal("")]).optional(),
  description: z.string().trim().optional().or(z.literal("")),
})
