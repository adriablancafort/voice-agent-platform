import { and, eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { agentsTable, agentVersionsTable } from "@workspace/db/schema/agents"
import type { AgentConfig } from "@workspace/shared/agent-config/types"
import {
  agentIdParamsSchema,
  agentVersionParamsSchema,
  createAgentInputSchema,
  publishAgentInputSchema,
  sipInboundAgentConfigInputSchema,
  updateAgentInputSchema,
  webrtcAgentConfigInputSchema,
} from "@workspace/shared/agents/schemas"
import type {
  AgentDetail,
  AgentDraft,
  AgentListItem,
  AgentVersionDetail,
  AgentVersionSummary,
  AgentVersionsList,
} from "@workspace/shared/agents/types"
import { requireOrganization } from "@/lib/auth/organization"
import { requireAuthToken } from "@/lib/auth/token"
import { validator } from "@/lib/validator"

export const agentRoutes = new Hono()

agentRoutes.get("/", requireOrganization, async (c) => {
  const organizationId = c.get("organizationId")

  try {
    const agents = await db.query.agentsTable.findMany({
      where: {
        organizationId,
      },
      columns: {
        draftConfig: false,
      },
      with: {
        phoneNumbers: {
          columns: {
            number: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return c.json(agents satisfies AgentListItem[])
  } catch {
    return c.json({ error: "Failed to load agents" }, 500)
  }
})

agentRoutes.post(
  "/",
  requireOrganization,
  validator("json", createAgentInputSchema),
  async (c) => {
    const organizationId = c.get("organizationId")

    try {
      const payload = c.req.valid("json")

      const [agent] = await db
        .insert(agentsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          name: payload.name,
          draftConfig: payload.draftConfig,
        })
        .returning()

      return c.json(agent satisfies AgentDraft, 201)
    } catch {
      return c.json({ error: "Failed to create agent" }, 500)
    }
  }
)

agentRoutes.post(
  "/config/webrtc",
  requireAuthToken,
  validator("json", webrtcAgentConfigInputSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

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
          return c.json({ error: "Agent version not found" }, 404)
        }

        return c.json(version.config satisfies AgentConfig)
      }

      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: payload.agentId,
        },
        columns: {
          draftConfig: true,
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(agent.draftConfig satisfies AgentConfig)
    } catch {
      return c.json({ error: "Failed to resolve agent config" }, 500)
    }
  }
)

agentRoutes.post(
  "/config/sip-inbound",
  requireAuthToken,
  validator("json", sipInboundAgentConfigInputSchema),
  async (c) => {
    try {
      const payload = c.req.valid("json")

      const phoneNumber = await db.query.phoneNumbersTable.findFirst({
        where: {
          number: payload.number,
        },
        columns: {
          agentId: true,
          agentVersionId: true,
        },
      })

      if (!phoneNumber) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      if (!phoneNumber.agentId) {
        return c.json({ error: "Phone number has no agent assigned" }, 404)
      }

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
          return c.json({ error: "Agent version not found" }, 404)
        }

        return c.json(version.config satisfies AgentConfig)
      }

      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: phoneNumber.agentId,
        },
        columns: {
          draftConfig: true,
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(agent.draftConfig satisfies AgentConfig)
    } catch {
      return c.json({ error: "Failed to resolve agent config" }, 500)
    }
  }
)

agentRoutes.post(
  "/:id/duplicate",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const sourceAgent = await db.query.agentsTable.findFirst({
        where: {
          id: agentId,
          organizationId,
        },
      })

      if (!sourceAgent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      const [duplicatedAgent] = await db
        .insert(agentsTable)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          name: `${sourceAgent.name} (copy)`.slice(0, 255),
          draftConfig: sourceAgent.draftConfig,
        })
        .returning()

      return c.json(duplicatedAgent satisfies AgentDraft, 201)
    } catch {
      return c.json({ error: "Failed to duplicate agent" }, 500)
    }
  }
)

agentRoutes.get(
  "/:id",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: agentId,
          organizationId,
        },
        with: {
          versions: {
            columns: {
              agentId: false,
              config: false,
            },
            orderBy: {
              number: "desc",
            },
          },
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(agent satisfies AgentDetail)
    } catch {
      return c.json({ error: "Failed to load agent" }, 500)
    }
  }
)

agentRoutes.patch(
  "/:id",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  validator("json", updateAgentInputSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const payload = c.req.valid("json")

      const [agent] = await db
        .update(agentsTable)
        .set({
          updatedAt: new Date(),
          name: payload.name,
          draftConfig: payload.draftConfig,
        })
        .where(
          and(
            eq(agentsTable.id, agentId),
            eq(agentsTable.organizationId, organizationId)
          )
        )
        .returning()

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(agent satisfies AgentDraft)
    } catch {
      return c.json({ error: "Failed to update agent" }, 500)
    }
  }
)

agentRoutes.delete(
  "/:id",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const [deletedAgent] = await db
        .delete(agentsTable)
        .where(
          and(
            eq(agentsTable.id, agentId),
            eq(agentsTable.organizationId, organizationId)
          )
        )
        .returning({
          id: agentsTable.id,
        })

      if (!deletedAgent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(deletedAgent)
    } catch {
      return c.json({ error: "Failed to delete agent" }, 500)
    }
  }
)

agentRoutes.get(
  "/:id/versions",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: agentId,
          organizationId,
        },
        columns: {
          id: true,
        },
        with: {
          versions: {
            columns: {
              agentId: false,
              config: false,
            },
            orderBy: {
              number: "desc",
            },
          },
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(agent.versions satisfies AgentVersionsList)
    } catch {
      return c.json({ error: "Failed to load agent versions" }, 500)
    }
  }
)

agentRoutes.get(
  "/:id/versions/:number",
  requireOrganization,
  validator("param", agentVersionParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId, number: versionNumber } = c.req.valid("param")

    try {
      const version = await db.query.agentVersionsTable.findFirst({
        columns: {
          agentId: false,
        },
        where: {
          agentId,
          number: versionNumber,
          agent: {
            organizationId,
          },
        },
      })

      if (!version) {
        return c.json({ error: "Agent version not found" }, 404)
      }

      return c.json(version satisfies AgentVersionDetail)
    } catch {
      return c.json({ error: "Failed to load agent version" }, 500)
    }
  }
)

agentRoutes.post(
  "/:id/publish",
  requireOrganization,
  validator("param", agentIdParamsSchema),
  validator("json", publishAgentInputSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id: agentId } = c.req.valid("param")

    try {
      const payload = c.req.valid("json")

      const publishedVersion = await db.transaction(async (tx) => {
        const agent = await tx.query.agentsTable.findFirst({
          where: {
            id: agentId,
            organizationId,
          },
        })

        if (!agent) {
          return null
        }

        const latestVersion = await tx.query.agentVersionsTable.findFirst({
          where: {
            agentId,
          },
          columns: {
            number: true,
          },
          orderBy: {
            number: "desc",
          },
        })

        const nextNumber = (latestVersion?.number ?? 0) + 1

        const [version] = await tx
          .insert(agentVersionsTable)
          .values({
            id: crypto.randomUUID(),
            agentId,
            number: nextNumber,
            name: payload.name,
            description: payload.description,
            config: agent.draftConfig,
          })
          .returning({
            id: agentVersionsTable.id,
            number: agentVersionsTable.number,
            name: agentVersionsTable.name,
            description: agentVersionsTable.description,
            publishedAt: agentVersionsTable.publishedAt,
            createdAt: agentVersionsTable.createdAt,
          })

        return version
      })

      if (!publishedVersion) {
        return c.json({ error: "Agent not found" }, 404)
      }

      return c.json(publishedVersion satisfies AgentVersionSummary, 201)
    } catch {
      return c.json({ error: "Failed to publish agent version" }, 500)
    }
  }
)
