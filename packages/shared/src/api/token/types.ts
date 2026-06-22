import type { z } from "zod"

import type { createTokenRequestSchema } from "./schemas"

export type CreateTokenRequest = z.infer<typeof createTokenRequestSchema>

export type CreateTokenResponse = {
  server_url: string
  participant_token: string
}
