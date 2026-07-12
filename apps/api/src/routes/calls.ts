import { eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { callsTable } from "@workspace/db/schema/calls"
import type { AgentConfig } from "@workspace/shared/api/agent-config/types"
import {
  completeCallRequestSchema,
  startInboundCallRequestSchema,
  startOutboundCallRequestSchema,
  startWebCallRequestSchema,
  triggerOutboundCallRequestSchema,
} from "@workspace/shared/api/calls/schemas"
import type {
  CallListResponse,
  CompleteCallResponse,
  StartCallResponse,
  TriggerOutboundCallResponse,
} from "@workspace/shared/api/calls/types"
import { requireOrganization, requirePermission } from "@/lib/auth/organization"
import { requireAuthToken } from "@/lib/auth/token"
import { computeCallCosts } from "@/lib/call-cost"
import { placeOutboundCall } from "@/lib/livekit"
import { validator } from "@/lib/validator"

export const callRoutes = new Hono()

type ResolvedAgentConfig = {
  organizationId: string
  agentVersionId: string | null
  config: AgentConfig
}

async function resolveAgentConfig(
  agentId: string,
  agentVersionId: string | null
): Promise<ResolvedAgentConfig | null> {
  const agent = await db.query.agentsTable.findFirst({
    where: {
      id: agentId,
    },
    columns: {
      organizationId: true,
      config: true,
    },
  })

  if (!agent) {
    return null
  }

  if (agentVersionId) {
    const version = await db.query.agentVersionsTable.findFirst({
      where: {
        id: agentVersionId,
        agentId,
      },
      columns: {
        config: true,
      },
    })

    if (!version) {
      return null
    }

    return {
      organizationId: agent.organizationId,
      agentVersionId,
      config: version.config,
    }
  }

  return {
    organizationId: agent.organizationId,
    agentVersionId: null,
    config: agent.config,
  }
}

callRoutes.post(
  "/start/web",
  requireAuthToken,
  validator("json", startWebCallRequestSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const resolved = await resolveAgentConfig(
        payload.agentId,
        payload.agentVersionId
      )

      if (!resolved) {
        return c.json({ error: "Agent not found" }, 404)
      }

      const [call] = await db
        .insert(callsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId: resolved.organizationId,
          agentId: payload.agentId,
          agentVersionId: resolved.agentVersionId,
          channel: "web_call",
          direction: "inbound",
          status: "in_progress",
          sttModel: resolved.config.stt.model,
          llmModel: resolved.config.llm.model,
          ttsModel: resolved.config.tts.model,
          livekitRoomName: payload.livekitRoomName,
          startedAt: new Date(payload.startedAt),
        })
        .returning({ id: callsTable.id })

      return c.json(
        {
          callId: call.id,
          config: resolved.config,
        } satisfies StartCallResponse,
        201
      )
    } catch {
      return c.json({ error: "Failed to start call" }, 500)
    }
  }
)

callRoutes.post(
  "/start/inbound",
  requireAuthToken,
  validator("json", startInboundCallRequestSchema),
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

      const resolved = await resolveAgentConfig(
        phoneNumber.agentId,
        phoneNumber.agentVersionId
      )

      if (!resolved) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      const [call] = await db
        .insert(callsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId: phoneNumber.organizationId,
          agentId: phoneNumber.agentId,
          agentVersionId: resolved.agentVersionId,
          channel: "phone_call",
          direction: "inbound",
          status: "in_progress",
          fromNumber: payload.fromNumber,
          toNumber: payload.toNumber,
          sttModel: resolved.config.stt.model,
          llmModel: resolved.config.llm.model,
          ttsModel: resolved.config.tts.model,
          livekitRoomName: payload.livekitRoomName,
          startedAt: new Date(payload.startedAt),
        })
        .returning({ id: callsTable.id })

      return c.json(
        {
          callId: call.id,
          config: resolved.config,
        } satisfies StartCallResponse,
        201
      )
    } catch {
      return c.json({ error: "Failed to start call" }, 500)
    }
  }
)

callRoutes.post(
  "/start/outbound",
  requireAuthToken,
  validator("json", startOutboundCallRequestSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const resolved = await resolveAgentConfig(
        payload.agentId,
        payload.agentVersionId
      )

      if (!resolved) {
        return c.json({ error: "Agent not found" }, 404)
      }

      const [call] = await db
        .insert(callsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId: resolved.organizationId,
          agentId: payload.agentId,
          agentVersionId: resolved.agentVersionId,
          channel: "phone_call",
          direction: "outbound",
          status: "in_progress",
          fromNumber: payload.fromNumber,
          toNumber: payload.toNumber,
          sttModel: resolved.config.stt.model,
          llmModel: resolved.config.llm.model,
          ttsModel: resolved.config.tts.model,
          livekitRoomName: payload.livekitRoomName,
          startedAt: new Date(payload.startedAt),
        })
        .returning({ id: callsTable.id })

      return c.json(
        {
          callId: call.id,
          config: resolved.config,
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
  validator("json", completeCallRequestSchema),
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
      const costs = computeCallCosts({
        durationMs,
        channel: call.channel,
        sttModel: call.sttModel,
        llmModel: call.llmModel,
        ttsModel: call.ttsModel,
      })

      const [updated] = await db
        .update(callsTable)
        .set({
          status: payload.status,
          endedAt,
          durationMs,
          sttCost: costs.stt.toFixed(6),
          llmCost: costs.llm.toFixed(6),
          ttsCost: costs.tts.toFixed(6),
          telephonyCost: costs.telephony.toFixed(6),
          platformCost: costs.platform.toFixed(6),
          totalCost: costs.total.toFixed(6),
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

callRoutes.get("/", requireOrganization, async (c) => {
  const organizationId = c.get("organizationId")

  try {
    const calls = await db.query.callsTable.findMany({
      where: {
        organizationId,
      },
      with: {
        agent: {
          columns: {
            name: true,
          },
        },
        agentVersion: {
          columns: {
            number: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    })

    return c.json(calls satisfies CallListResponse)
  } catch {
    return c.json({ error: "Failed to load calls" }, 500)
  }
})

callRoutes.post(
  "/outbound",
  requireOrganization,
  requirePermission({ calls: ["create"] }),
  validator("json", triggerOutboundCallRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const payload = c.req.valid("json")

    try {
      const phoneNumber = await db.query.phoneNumbersTable.findFirst({
        where: {
          id: payload.phoneNumberId,
          organizationId,
        },
        columns: {
          number: true,
          sipAddress: true,
          sipUsername: true,
          sipPassword: true,
        },
      })

      if (!phoneNumber) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      if (
        !phoneNumber.sipAddress ||
        !phoneNumber.sipUsername ||
        !phoneNumber.sipPassword
      ) {
        return c.json({ error: "Phone number has no SIP connection" }, 400)
      }

      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: payload.agentId,
          organizationId,
        },
        columns: {
          id: true,
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      if (payload.agentVersionId) {
        const version = await db.query.agentVersionsTable.findFirst({
          where: {
            id: payload.agentVersionId,
            agentId: payload.agentId,
          },
          columns: {
            id: true,
          },
        })

        if (!version) {
          return c.json({ error: "Agent version not found" }, 404)
        }
      }

      await placeOutboundCall({
        agentId: payload.agentId,
        agentVersionId: payload.agentVersionId ?? null,
        toNumber: payload.toNumber,
        fromNumber: phoneNumber.number,
        sipAddress: phoneNumber.sipAddress,
        sipUsername: phoneNumber.sipUsername,
        sipPassword: phoneNumber.sipPassword,
        variables: payload.variables ?? {},
      })

      return c.json({ ok: true } satisfies TriggerOutboundCallResponse)
    } catch {
      return c.json({ error: "Failed to start outbound call" }, 500)
    }
  }
)
