import { createMiddleware } from "hono/factory"

import { auth } from "@/lib/auth/config"

export const requireOrganization = createMiddleware<{
  Variables: { organizationId: string }
}>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!result) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const organizationId = result.session.activeOrganizationId

  if (!organizationId) {
    return c.json({ error: "No active organization" }, 400)
  }

  c.set("organizationId", organizationId)

  await next()
})

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
