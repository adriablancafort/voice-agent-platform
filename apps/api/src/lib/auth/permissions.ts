import { createMiddleware } from "hono/factory"

import { auth } from "@/lib/auth/config"

export function requirePermission(permissions: Record<string, string[]>) {
  return createMiddleware(async (c, next) => {
    const result = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: { permissions },
    })

    if (!result.success) {
      return c.json({ error: "Forbidden" }, 403)
    }

    await next()
  })
}
