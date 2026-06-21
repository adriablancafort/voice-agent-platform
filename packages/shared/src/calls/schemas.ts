import { z } from "zod"

export const startWebCallInputSchema = z
  .object({
    agentId: z.uuid(),
    agentVersionId: z.uuid().nullable(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const startPhoneCallInputSchema = z
  .object({
    toNumber: z.e164(),
    fromNumber: z.string().trim().min(1).optional(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const completeCallInputSchema = z
  .object({
    callId: z.uuid(),
    endedAt: z.iso.datetime(),
  })
  .strict()
