import { z } from "zod"

export const batchCallIdParamsSchema = z.object({
  id: z.uuid(),
})

export const batchCallRecipientSchema = z
  .object({
    toNumber: z.e164(),
    variables: z.record(z.string(), z.string()).optional(),
  })
  .strict()

export const createBatchCallRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    phoneNumberId: z.uuid(),
    agentId: z.uuid(),
    agentVersionId: z.uuid().nullable().optional(),
    recipients: z.array(batchCallRecipientSchema).min(1).max(500),
    scheduledAt: z.iso.datetime().nullable().optional(),
  })
  .strict()
