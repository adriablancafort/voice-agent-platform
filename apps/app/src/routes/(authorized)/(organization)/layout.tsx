import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"

import { fullOrganizationQueryOptions } from "@/lib/auth/organization"

export const Route = createFileRoute("/(authorized)/(organization)")({
  component: OrganizationLayout,
})

function OrganizationRedirectGuard() {
  const { data: organization, isSuccess } = useQuery(
    fullOrganizationQueryOptions()
  )

  if (isSuccess && !organization) {
    return <Navigate to="/select-organization" />
  }

  return null
}

function OrganizationLayout() {
  return (
    <>
      <OrganizationRedirectGuard />
      <Outlet />
    </>
  )
}
