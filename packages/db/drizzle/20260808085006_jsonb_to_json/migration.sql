ALTER TABLE "agent_versions" ALTER COLUMN "config" SET DATA TYPE json USING "config"::json;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "config" SET DATA TYPE json USING "config"::json;--> statement-breakpoint
ALTER TABLE "batch_call_recipients" ALTER COLUMN "variables" SET DATA TYPE json USING "variables"::json;--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "transcript" SET DATA TYPE json USING "transcript"::json;--> statement-breakpoint
ALTER TABLE "calls" ALTER COLUMN "variables" SET DATA TYPE json USING "variables"::json;