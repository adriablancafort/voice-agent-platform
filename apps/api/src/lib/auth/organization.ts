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
