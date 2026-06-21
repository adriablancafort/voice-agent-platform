CREATE TABLE "calls" (
	"id" uuid PRIMARY KEY,
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid,
	"channel" text NOT NULL,
	"from_number" text,
	"to_number" text,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"total_cost" numeric(12,6),
	"livekit_room_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "calls_organization_id_started_at_idx" ON "calls" ("organization_id","started_at");--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_version_id_agent_versions_id_fkey" FOREIGN KEY ("agent_version_id") REFERENCES "agent_versions"("id") ON DELETE SET NULL;