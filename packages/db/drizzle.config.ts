import { defineConfig } from "drizzle-kit"

import { env } from "@workspace/db/lib/env"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
