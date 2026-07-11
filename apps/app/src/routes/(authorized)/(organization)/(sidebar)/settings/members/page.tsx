import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { FieldLegend, FieldSet } from "@workspace/ui/components/field"
import { InvitationsTable } from "@/components/settings/members/invitations-table"
import { MembersTable } from "@/components/settings/members/members-table"
import {
  activeMemberQueryOptions,
  organizationInvitationsQueryOptions,
  organizationMembersQueryOptions,
} from "@/lib/auth/organization"
import { sessionQueryOptions } from "@/lib/auth/session"

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/settings/members/"
)({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sessionQueryOptions()),
      context.queryClient.ensureQueryData(activeMemberQueryOptions()),
      context.queryClient.ensureQueryData(organizationMembersQueryOptions()),
      context.queryClient.ensureQueryData(
        organizationInvitationsQueryOptions()
      ),
    ])
  },
  component: Page,
})

function Page() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions())
  const { data: activeMember } = useSuspenseQuery(activeMemberQueryOptions())
  const { data: members } = useSuspenseQuery(organizationMembersQueryOptions())
  const { data: invitations } = useSuspenseQuery(
    organizationInvitationsQueryOptions()
  )

  if (!session || !activeMember) {
    return null
  }

  return (
    <>
      <title>Members settings</title>
      <div className="space-y-8">
        <MembersTable
          data={members}
          currentUserId={session.user.id}
          currentUserRole={activeMember.role}
        />
        <div>
          <FieldSet>
            <FieldLegend>Pending invitations</FieldLegend>
          </FieldSet>
          <InvitationsTable
            data={invitations}
            currentUserRole={activeMember.role}
          />
        </div>
      </div>
    </>
  )
}
