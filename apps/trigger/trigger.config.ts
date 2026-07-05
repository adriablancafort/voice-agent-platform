import { defineConfig } from "@trigger.dev/sdk"

import { env } from "./src/lib/env"

export default defineConfig({
  project: env.TRIGGER_PROJECT_ID,
  runtime: "node",
  maxDuration: 3600,
  dirs: ["./src/tasks"],
})
