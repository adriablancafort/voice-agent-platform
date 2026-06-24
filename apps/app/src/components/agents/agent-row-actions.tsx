import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import type {
  AgentsListItem,
  DeleteAgentResponse,
  DuplicateAgentResponse,
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
import { api } from "@/lib/api"

export function AgentRowActions({ agent }: { agent: AgentsListItem }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const duplicateAgentMutation = useMutation({
    mutationFn: () =>
      api.post<DuplicateAgentResponse, never>(
        `/agents/${agent.id}/duplicate`,
        {}
      ),
    onSuccess: () => {
      toast.success("Agent duplicated")
      queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteAgentMutation = useMutation({
    mutationFn: () => api.delete<DeleteAgentResponse>(`/agents/${agent.id}`),
    onSuccess: () => {
      toast.success(`${agent.name} deleted`)
      setOpen(false)
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
        setOpen(nextOpen)
        deleteAgentMutation.reset()
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Open actions for ${agent.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem
            disabled={duplicateAgentMutation.isPending}
            onClick={() => duplicateAgentMutation.mutate()}
          >
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>
          <AlertDialogTrigger
            render={
              <DropdownMenuItem
                variant="destructive"
                disabled={deleteAgentMutation.isPending}
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
            <Trash2Icon />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
