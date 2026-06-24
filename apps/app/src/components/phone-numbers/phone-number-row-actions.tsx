import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import type { PhoneNumberListResponse } from "@workspace/shared/api/phone-numbers/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { EditPhoneNumberForm } from "@/components/phone-numbers/edit-phone-number-form"
import { api } from "@/lib/api"

type PhoneNumberRowActionsProps = {
  phoneNumber: PhoneNumberListResponse[number]
}

export function PhoneNumberRowActions({
  phoneNumber,
}: PhoneNumberRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const deletePhoneNumberMutation = useMutation({
    mutationFn: () => api.delete(`/phone-numbers/${phoneNumber.id}`),
    onSuccess: () => {
      toast.success(`${phoneNumber.number} deleted`)
      setDeleteOpen(false)
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] })
      queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          setDeleteOpen(nextOpen)
          deletePhoneNumberMutation.reset()
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Open actions for ${phoneNumber.number}`}
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <AlertDialogTrigger
              render={
                <DropdownMenuItem
                  variant="destructive"
                  disabled={deletePhoneNumberMutation.isPending}
                >
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete phone number</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{phoneNumber.number}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePhoneNumberMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletePhoneNumberMutation.isPending}
              onClick={() => deletePhoneNumberMutation.mutate()}
            >
              <Trash2Icon />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPhoneNumberForm
        phoneNumber={phoneNumber}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
