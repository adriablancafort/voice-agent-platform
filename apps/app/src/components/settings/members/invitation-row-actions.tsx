import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { organization } from "@/lib/auth/client"
import type {
  OrganizationInvitation,
  OrganizationRole,
} from "@/lib/auth/organization"

type InvitationRowActionsProps = {
  invitation: OrganizationInvitation
  currentUserRole: OrganizationRole
}

export function InvitationRowActions({
  invitation,
  currentUserRole,
}: InvitationRowActionsProps) {
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)

  const canCancel = organization.checkRolePermission({
    permissions: { invitation: ["cancel"] },
    role: currentUserRole,
  })

  const cancelInvitationMutation = useMutation({
    mutationFn: async () => {
      const result = await organization.cancelInvitation({
        invitationId: invitation.id,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success(`Invitation to ${invitation.email} canceled`)
      setCancelOpen(false)
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (!canCancel) {
    return null
  }

  return (
    <>
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the invitation sent to {invitation.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelInvitationMutation.isPending}>
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelInvitationMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                cancelInvitationMutation.mutate()
              }}
            >
              {cancelInvitationMutation.isPending ? (
                <Spinner className="mx-6 size-4" />
              ) : (
                "Cancel invitation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Open actions for ${invitation.email}`}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setCancelOpen(true)}
          >
            <Trash2Icon />
            Cancel invitation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
