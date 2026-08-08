import {
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { organization } from "@workspace/db/schema/auth"
import type { AgentConfig } from "@workspace/shared/api/agent-config/types"

export const agentsTable = pgTable(
  "agents",
  {
    id: uuid().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    config: json().$type<AgentConfig>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("agents_organizationId_idx").on(table.organizationId)]
)

export const agentVersionsTable = pgTable(
  "agent_versions",
  {
    id: uuid().primaryKey(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentsTable.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    name: varchar({ length: 255 }),
    description: text(),
    config: json().$type<AgentConfig>().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueVersionNumberPerAgent: unique("unique_version_number_per_agent").on(
      table.agentId,
      table.number
    ),
  })
)
