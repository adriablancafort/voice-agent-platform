import { Hono } from "hono"
import { AccessToken, RoomConfiguration } from "livekit-server-sdk"
import { env } from "@/lib/env"

export const tokenRoutes = new Hono()

tokenRoutes.post("/", async (c) => {
  const body = await c.req.json()

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
    accessToken.roomConfig = RoomConfiguration.fromJson(body.room_config)
  }

  const participantToken = await accessToken.toJwt()

  return c.json(
    {
      server_url: env.LIVEKIT_URL,
      participant_token: participantToken,
    },
    201
  )
})
