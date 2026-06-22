import { Hono } from "hono"
import { AccessToken, RoomConfiguration } from "livekit-server-sdk"

import { createTokenRequestSchema } from "@workspace/shared/api/token/schemas"
import type { CreateTokenResponse } from "@workspace/shared/api/token/types"
import { requireOrganization } from "@/lib/auth/organization"
import { env } from "@/lib/env"
import { validator } from "@/lib/validator"

export const tokenRoutes = new Hono()

tokenRoutes.post(
  "/",
  requireOrganization,
  validator("json", createTokenRequestSchema),
  async (c) => {
    const body = c.req.valid("json")

    const sessionId = crypto.randomUUID()
    const room = body.room_name ?? `session-${sessionId}`
    const identity = body.participant_identity ?? `user-${sessionId}`
    const name = body.participant_name ?? "user"
    const metadata = body.participant_metadata ?? ""
    const attributes = body.participant_attributes ?? {}

    const accessToken = new AccessToken(
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
      {
        identity,
        name,
        metadata,
        attributes,
        ttl: "10m",
      }
    )

    accessToken.addGrant({ room, roomJoin: true })

    if (body.room_config) {
      accessToken.roomConfig = RoomConfiguration.fromJson(
        body.room_config as Parameters<typeof RoomConfiguration.fromJson>[0]
      )
    }

    const participantToken = await accessToken.toJwt()

    return c.json(
      {
        server_url: env.LIVEKIT_URL,
        participant_token: participantToken,
      } satisfies CreateTokenResponse,
      201
    )
  }
)
