import { z } from "zod"

import type { OrganizationRoleName } from "@workspace/shared/auth/permissions"

export const assignableRoleSchema = z.enum(["admin", "member"])

export type AssignableRole = z.infer<typeof assignableRoleSchema>

export const assignableRoles = assignableRoleSchema.options

export const roleLabels: Record<OrganizationRoleName, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

export function toAssignableRole(
  role: string | null | undefined
): AssignableRole {
  return assignableRoles.includes(role as AssignableRole)
    ? (role as AssignableRole)
    : "member"
}
