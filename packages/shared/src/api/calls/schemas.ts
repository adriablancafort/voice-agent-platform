import { z } from "zod"

export const startWebCallRequestSchema = z
  .object({
    agentId: z.uuid(),
    agentVersionId: z.uuid().nullable(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const startInboundCallRequestSchema = z
  .object({
    fromNumber: z.string(),
    toNumber: z.e164(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const startOutboundCallRequestSchema = z
  .object({
    agentId: z.uuid(),
    agentVersionId: z.uuid().nullable(),
    fromNumber: z.e164(),
    toNumber: z.e164(),
    livekitRoomName: z.string().trim().min(1),
    startedAt: z.iso.datetime(),
  })
  .strict()

export const completeCallRequestSchema = z
  .object({
    callId: z.uuid(),
    endedAt: z.iso.datetime(),
    status: z.enum(["completed"]),
  })
  .strict()
