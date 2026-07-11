import { useSuspenseQuery } from "@tanstack/react-query"

import { organization } from "@/lib/auth/client"
import { activeMemberQueryOptions } from "@/lib/auth/organization"

type PermissionCheck = Parameters<
  typeof organization.checkRolePermission
>[0]["permissions"]

export function useCheckPermission(permissions: PermissionCheck) {
  const { data: activeMember } = useSuspenseQuery(activeMemberQueryOptions())

  return organization.checkRolePermission({
    permissions,
    role: activeMember.role,
  })
}
