import { z } from "zod"

export const phoneNumberIdParamsSchema = z.object({
  id: z.uuid(),
})

export const createPhoneNumberRequestSchema = z
  .object({
    number: z.e164(),
    agentId: z.uuid().nullable().optional(),
    agentVersionId: z.uuid().nullable().optional(),
  })
  .refine((data) => !data.agentVersionId || data.agentId, {
    message: "Agent is required when a version is selected",
    path: ["agentId"],
  })

export const updatePhoneNumberRequestSchema = z
  .object({
    number: z.e164().optional(),
    agentId: z.uuid().nullable().optional(),
    agentVersionId: z.uuid().nullable().optional(),
  })
  .refine((data) => !data.agentVersionId || !!data.agentId, {
    message: "Agent is required when a version is selected",
    path: ["agentId"],
  })
