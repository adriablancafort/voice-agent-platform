import { z } from "zod"

export const startWebCallRequestSchema = z
  .object({
    agentId: z.uuid(),
    agentVersionId: z.uuid().nullable(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const startPhoneCallRequestSchema = z
  .object({
    toNumber: z.e164(),
    fromNumber: z.string().trim().min(1).optional(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const completeCallRequestSchema = z
  .object({
    callId: z.uuid(),
    endedAt: z.iso.datetime(),
  })
  .strict()
