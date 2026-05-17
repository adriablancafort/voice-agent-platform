import { defineRelations } from "drizzle-orm"
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import type { AgentConfig } from "@workspace/shared/agent-config/types"

export const agentsTable = pgTable("agents", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  draftConfig: jsonb("draft_config").$type<AgentConfig>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
})

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
    config: jsonb().$type<AgentConfig>().notNull(),
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

export const relations = defineRelations(
  { agentsTable, agentVersionsTable },
  (r) => ({
    agentsTable: {
      versions: r.many.agentVersionsTable({
        from: r.agentsTable.id,
        to: r.agentVersionsTable.agentId,
      }),
    },
    agentVersionsTable: {
      agent: r.one.agentsTable({
        from: r.agentVersionsTable.agentId,
        to: r.agentsTable.id,
      }),
    },
  })
)
