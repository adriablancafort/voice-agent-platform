import { useMutation, useQueryClient } from "@tanstack/react-query"

import type {
  AgentsListItem,
  DeleteAgentResponse,
} from "@workspace/shared/api/agents/types"
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
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/api"

type DeleteAgentDialogProps = {
  agent: AgentsListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAgentDialog({
  agent,
  open,
  onOpenChange,
}: DeleteAgentDialogProps) {
  const queryClient = useQueryClient()

  const deleteAgentMutation = useMutation({
    mutationFn: () => api.delete<DeleteAgentResponse>(`/agents/${agent.id}`),
    onSuccess: () => {
      toast.success(`${agent.name} deleted`)
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        deleteAgentMutation.reset()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete agent</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{agent.name}"
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAgentMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteAgentMutation.isPending}
            onClick={() => deleteAgentMutation.mutate()}
          >
            {deleteAgentMutation.isPending ? (
              <Spinner className="mx-3" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
