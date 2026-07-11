import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import {
  activeMemberQueryOptions,
  fullOrganizationQueryOptions,
} from "@/lib/auth/organization"

export const Route = createFileRoute("/(authorized)/(organization)")({
  beforeLoad: async ({ context }) => {
    const [organization] = await Promise.all([
      context.queryClient.ensureQueryData(fullOrganizationQueryOptions()),
      context.queryClient.ensureQueryData(activeMemberQueryOptions()),
    ])

    if (!organization) {
      throw redirect({ to: "/select-organization" })
    }
  },
  component: Outlet,
})
