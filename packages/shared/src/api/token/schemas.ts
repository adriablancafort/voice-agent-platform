import { z } from "zod"

export const createTokenRequestSchema = z
  .object({
    room_name: z.string().optional(),
    participant_identity: z.string().optional(),
    participant_name: z.string().optional(),
    participant_metadata: z.string().optional(),
    participant_attributes: z.record(z.string(), z.string()).optional(),
    room_config: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
