import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { organization } from "@/lib/auth/client"
import {
  activeMemberQueryOptions,
  type OrganizationInvitation,
  type OrganizationMember,
} from "@/lib/auth/organization"
import { useCheckPermission } from "@/lib/auth/permissions"
import {
  type AssignableRole,
  assignableRoles,
  roleLabels,
  toAssignableRole,
} from "@/lib/auth/roles"

type SelectRoleProps = {
  value: AssignableRole
  disabled?: boolean
  ariaLabel: string
  onValueChange: (role: AssignableRole) => void
}

function SelectRole({
  value,
  disabled,
  ariaLabel,
  onValueChange,
}: SelectRoleProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue as AssignableRole)
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-28" aria-label={ariaLabel}>
        <SelectValue>{roleLabels[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {assignableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabels[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type MemberRoleSelectProps = {
  member: OrganizationMember
}

export function MemberRoleSelect({ member }: MemberRoleSelectProps) {
  const queryClient = useQueryClient()
  const { data: activeMember } = useSuspenseQuery(activeMemberQueryOptions())
  const canUpdate = useCheckPermission({ member: ["update"] })
  const isCurrentUser = member.userId === activeMember.userId

  const updateRoleMutation = useMutation({
    mutationFn: async (nextRole: AssignableRole) => {
      const result = await organization.updateMemberRole({
        memberId: member.id,
        role: nextRole,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: (_data, nextRole) => {
      toast.success(`${member.user.name} is now ${roleLabels[nextRole]}`)
      queryClient.invalidateQueries({ queryKey: ["organization-members"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (member.role.includes("owner")) {
    return <span>{roleLabels.owner}</span>
  }

  return (
    <SelectRole
      value={toAssignableRole(member.role)}
      ariaLabel={`Role for ${member.user.name}`}
      disabled={!canUpdate || isCurrentUser || updateRoleMutation.isPending}
      onValueChange={(role) => updateRoleMutation.mutate(role)}
    />
  )
}

type InvitationRoleSelectProps = {
  invitation: OrganizationInvitation
}

export function InvitationRoleSelect({
  invitation,
}: InvitationRoleSelectProps) {
  const queryClient = useQueryClient()
  const canCreate = useCheckPermission({ invitation: ["create"] })
  const canCancel = useCheckPermission({ invitation: ["cancel"] })
  const canUpdateRole = canCreate && canCancel
  const role = toAssignableRole(invitation.role)

  const updateRoleMutation = useMutation({
    mutationFn: async (nextRole: AssignableRole) => {
      if (nextRole === role) {
        return
      }

      const cancelResult = await organization.cancelInvitation({
        invitationId: invitation.id,
      })
      if (cancelResult.error) {
        throw new Error(cancelResult.error.message)
      }

      const inviteResult = await organization.inviteMember({
        email: invitation.email,
        role: nextRole,
      })
      if (inviteResult.error) {
        throw new Error(inviteResult.error.message)
      }
    },
    onSuccess: (_data, nextRole) => {
      toast.success(`Invitation role updated to ${roleLabels[nextRole]}`)
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <SelectRole
      value={role}
      ariaLabel={`Role for ${invitation.email}`}
      disabled={!canUpdateRole || updateRoleMutation.isPending}
      onValueChange={(nextRole) => updateRoleMutation.mutate(nextRole)}
    />
  )
}
