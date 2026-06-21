import { eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { callsTable } from "@workspace/db/schema/calls"
import {
  completeCallInputSchema,
  startPhoneCallInputSchema,
  startWebCallInputSchema,
} from "@workspace/shared/calls/schemas"
import type {
  CompleteCallResponse,
  StartCallResponse,
} from "@workspace/shared/calls/types"
import { requireAuthToken } from "@/lib/auth/token"
import { validator } from "@/lib/validator"

export const callRoutes = new Hono()

callRoutes.post(
  "/start/web",
  requireAuthToken,
  validator("json", startWebCallInputSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: payload.agentId,
        },
        columns: {
          id: true,
          organizationId: true,
          draftConfig: true,
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      let config = agent.draftConfig
      let agentVersionId: string | null = null

      if (payload.agentVersionId) {
        const version = await db.query.agentVersionsTable.findFirst({
          where: {
            id: payload.agentVersionId,
            agentId: payload.agentId,
          },
          columns: {
            config: true,
          },
        })

        if (!version) {
          return c.json({ error: "Agent not found" }, 404)
        }

        config = version.config
        agentVersionId = payload.agentVersionId
      }

      const [call] = await db
        .insert(callsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId: agent.organizationId,
          agentId: agent.id,
          agentVersionId,
          channel: "web_call",
          livekitRoomName: payload.livekitRoomName,
          startedAt: new Date(payload.startedAt),
        })
        .returning({ id: callsTable.id })

      return c.json(
        {
          callId: call.id,
          config,
        } satisfies StartCallResponse,
        201
      )
    } catch {
      return c.json({ error: "Failed to start call" }, 500)
    }
  }
)

callRoutes.post(
  "/start/phone",
  requireAuthToken,
  validator("json", startPhoneCallInputSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const phoneNumber = await db.query.phoneNumbersTable.findFirst({
        where: {
          number: payload.toNumber,
        },
        columns: {
          organizationId: true,
          agentId: true,
          agentVersionId: true,
        },
      })

      if (!phoneNumber?.agentId) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      let config = null
      let agentVersionId: string | null = null

      if (phoneNumber.agentVersionId) {
        const version = await db.query.agentVersionsTable.findFirst({
          where: {
            id: phoneNumber.agentVersionId,
            agentId: phoneNumber.agentId,
          },
          columns: {
            config: true,
          },
        })

        if (!version) {
          return c.json({ error: "Phone number not found" }, 404)
        }

        config = version.config
        agentVersionId = phoneNumber.agentVersionId
      } else {
        const agent = await db.query.agentsTable.findFirst({
          where: {
            id: phoneNumber.agentId,
          },
          columns: {
            draftConfig: true,
          },
        })

        if (!agent) {
          return c.json({ error: "Phone number not found" }, 404)
        }

        config = agent.draftConfig
      }

      const [call] = await db
        .insert(callsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId: phoneNumber.organizationId,
          agentId: phoneNumber.agentId,
          agentVersionId,
          channel: "phone_call",
          fromNumber: payload.fromNumber ?? null,
          toNumber: payload.toNumber,
          livekitRoomName: payload.livekitRoomName,
          startedAt: new Date(payload.startedAt),
        })
        .returning({ id: callsTable.id })

      return c.json(
        {
          callId: call.id,
          config,
        } satisfies StartCallResponse,
        201
      )
    } catch {
      return c.json({ error: "Failed to start call" }, 500)
    }
  }
)

callRoutes.post(
  "/complete",
  requireAuthToken,
  validator("json", completeCallInputSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const call = await db.query.callsTable.findFirst({
        where: {
          id: payload.callId,
        },
      })

      if (!call) {
        return c.json({ error: "Call not found" }, 404)
      }

      if (call.endedAt) {
        return c.json({ error: "Call already ended" }, 409)
      }

      const endedAt = new Date(payload.endedAt)

      if (endedAt.getTime() < call.startedAt.getTime()) {
        return c.json({ error: "endedAt must be after startedAt" }, 400)
      }

      const durationMs = endedAt.getTime() - call.startedAt.getTime()

      const [updated] = await db
        .update(callsTable)
        .set({
          endedAt,
          updatedAt: new Date(),
        })
        .where(eq(callsTable.id, payload.callId))
        .returning()

      return c.json({
        id: updated.id,
        durationMs,
      } satisfies CompleteCallResponse)
    } catch {
      return c.json({ error: "Failed to complete call" }, 500)
    }
  }
)
