import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { agentsTable, agentVersionsTable } from "@workspace/db/schema/agents"
import { organization } from "@workspace/db/schema/auth"

export const callsTable = pgTable(
  "calls",
  {
    id: uuid().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentsTable.id, { onDelete: "cascade" }),
    agentVersionId: uuid("agent_version_id").references(
      () => agentVersionsTable.id,
      { onDelete: "set null" }
    ),
    channel: text("channel").notNull().$type<"web_call" | "phone_call">(),
    fromNumber: text("from_number"),
    toNumber: text("to_number"),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
    totalCost: numeric("total_cost", { precision: 12, scale: 6 }),
    livekitRoomName: text("livekit_room_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("calls_organization_id_started_at_idx").on(
      table.organizationId,
      table.startedAt
    ),
  ]
)
