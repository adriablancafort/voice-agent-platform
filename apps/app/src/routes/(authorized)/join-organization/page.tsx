import { createFileRoute, redirect } from "@tanstack/react-router"

import { toast } from "@workspace/ui/components/sonner"
import { organization } from "@/lib/auth/client"

export const Route = createFileRoute("/(authorized)/join-organization/")({
  loader: async ({ context, location }) => {
    const invitationId = new URLSearchParams(location.searchStr).get(
      "invitationId"
    )

    if (!invitationId) {
      throw redirect({ to: "/" })
    }

    const result = await organization.acceptInvitation({ invitationId })

    if (result.error) {
      toast.error(result.error.message)
      throw redirect({ to: "/" })
    }

    await context.queryClient.refetchQueries()
    toast.success("Joined organization successfully")
    throw redirect({ to: "/" })
  },
})
