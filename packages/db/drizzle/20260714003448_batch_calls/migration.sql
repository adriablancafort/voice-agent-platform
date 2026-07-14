CREATE TABLE "batch_call_recipients" (
	"id" uuid PRIMARY KEY,
	"batch_call_id" uuid NOT NULL,
	"to_number" text NOT NULL,
	"variables" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_calls" (
	"id" uuid PRIMARY KEY,
	"organization_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone_number_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid,
	"status" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"total_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "batch_call_recipients_batch_call_id_idx" ON "batch_call_recipients" ("batch_call_id");--> statement-breakpoint
CREATE INDEX "batch_calls_organization_id_created_at_idx" ON "batch_calls" ("organization_id","created_at");--> statement-breakpoint
ALTER TABLE "batch_call_recipients" ADD CONSTRAINT "batch_call_recipients_batch_call_id_batch_calls_id_fkey" FOREIGN KEY ("batch_call_id") REFERENCES "batch_calls"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "batch_calls" ADD CONSTRAINT "batch_calls_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "batch_calls" ADD CONSTRAINT "batch_calls_phone_number_id_phone_numbers_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "phone_numbers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "batch_calls" ADD CONSTRAINT "batch_calls_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "batch_calls" ADD CONSTRAINT "batch_calls_agent_version_id_agent_versions_id_fkey" FOREIGN KEY ("agent_version_id") REFERENCES "agent_versions"("id") ON DELETE SET NULL;