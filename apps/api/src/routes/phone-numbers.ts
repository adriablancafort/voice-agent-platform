import { and, eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { phoneNumbersTable } from "@workspace/db/schema/phone-numbers"
import {
  createPhoneNumberRequestSchema,
  phoneNumberIdParamsSchema,
  updatePhoneNumberRequestSchema,
} from "@workspace/shared/api/phone-numbers/schemas"
import type {
  PhoneNumberListResponse,
  PhoneNumberResponse,
} from "@workspace/shared/api/phone-numbers/types"
import { requireOrganization } from "@/lib/auth/organization"
import { validator } from "@/lib/validator"

export const phoneNumberRoutes = new Hono()

phoneNumberRoutes.get("/", requireOrganization, async (c) => {
  const organizationId = c.get("organizationId")

  try {
    const phoneNumbers = await db.query.phoneNumbersTable.findMany({
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
        createdAt: "desc",
      },
    })

    return c.json(phoneNumbers satisfies PhoneNumberListResponse)
  } catch {
    return c.json({ error: "Failed to load phone numbers" }, 500)
  }
})

phoneNumberRoutes.post(
  "/",
  requireOrganization,
  validator("json", createPhoneNumberRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")

    try {
      const payload = c.req.valid("json")

      const agent = await db.query.agentsTable.findFirst({
        where: {
          id: payload.agentId!,
          organizationId,
        },
        columns: {
          id: true,
        },
      })

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404)
      }

      const [phoneNumber] = await db
        .insert(phoneNumbersTable)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          number: payload.number,
          agentId: payload.agentId ?? null,
          agentVersionId: payload.agentVersionId ?? null,
        })
        .returning()

      return c.json(phoneNumber satisfies PhoneNumberResponse, 201)
    } catch {
      return c.json({ error: "Failed to create phone number" }, 500)
    }
  }
)

phoneNumberRoutes.patch(
  "/:id",
  requireOrganization,
  validator("param", phoneNumberIdParamsSchema),
  validator("json", updatePhoneNumberRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id } = c.req.valid("param")

    try {
      const payload = c.req.valid("json")

      if (payload.agentId) {
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
      }

      const [phoneNumber] = await db
        .update(phoneNumbersTable)
        .set({
          number: payload.number,
          agentId: payload.agentId ?? null,
          agentVersionId: payload.agentVersionId ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(phoneNumbersTable.id, id),
            eq(phoneNumbersTable.organizationId, organizationId)
          )
        )
        .returning()

      if (!phoneNumber) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      return c.json(phoneNumber satisfies PhoneNumberResponse)
    } catch {
      return c.json({ error: "Failed to update phone number" }, 500)
    }
  }
)

phoneNumberRoutes.delete(
  "/:id",
  requireOrganization,
  validator("param", phoneNumberIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id } = c.req.valid("param")

    try {
      const [deletedPhoneNumber] = await db
        .delete(phoneNumbersTable)
        .where(
          and(
            eq(phoneNumbersTable.id, id),
            eq(phoneNumbersTable.organizationId, organizationId)
          )
        )
        .returning()

      if (!deletedPhoneNumber) {
        return c.json({ error: "Phone number not found" }, 404)
      }

      return c.json(deletedPhoneNumber satisfies PhoneNumberResponse)
    } catch {
      return c.json({ error: "Failed to delete phone number" }, 404)
    }
  }
)
