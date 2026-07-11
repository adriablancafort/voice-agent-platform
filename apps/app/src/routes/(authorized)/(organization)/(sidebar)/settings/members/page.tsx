import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { FieldLegend, FieldSet } from "@workspace/ui/components/field"
import { InvitationsTable } from "@/components/settings/members/invitations-table"
import { MembersTable } from "@/components/settings/members/members-table"
import {
  organizationInvitationsQueryOptions,
  organizationMembersQueryOptions,
} from "@/lib/auth/organization"

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/settings/members/"
)({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(organizationMembersQueryOptions()),
      context.queryClient.ensureQueryData(
        organizationInvitationsQueryOptions()
      ),
    ])
  },
  component: Page,
})

function Page() {
  const { data: members } = useSuspenseQuery(organizationMembersQueryOptions())
  const { data: invitations } = useSuspenseQuery(
    organizationInvitationsQueryOptions()
  )

  return (
    <>
      <title>Members settings</title>
      <div className="space-y-8">
        <MembersTable data={members} />
        <div>
          <FieldSet>
            <FieldLegend>Pending invitations</FieldLegend>
          </FieldSet>
          <InvitationsTable data={invitations} />
        </div>
      </div>
    </>
  )
}
