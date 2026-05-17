import { drizzle } from "drizzle-orm/node-postgres"
import { relations } from "@workspace/db/db/schema"
import { env } from "@workspace/db/lib/env"

export const db = drizzle(env.DATABASE_URL, { relations })
