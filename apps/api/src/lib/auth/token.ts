import { createMiddleware } from "hono/factory"

import { env } from "@/lib/env"

export const requireAuthToken = createMiddleware(async (c, next) => {
  if (c.req.header("Authorization") !== `Bearer ${env.API_TOKEN}`) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  await next()
})
