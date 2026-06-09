import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { sessionQueryOptions } from "@/lib/auth/session"

export const Route = createFileRoute("/(authorized)")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions()
    )

    if (!session) {
      throw redirect({ to: "/signin" })
    }
  },
  component: Outlet,
})
