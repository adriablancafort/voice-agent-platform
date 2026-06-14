import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SaveIcon } from "lucide-react"

import type {
  AgentDraft,
  UpdateAgentInput,
} from "@workspace/shared/agents/types"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { toServerDraftConfig } from "@/components/flow/draft-config"
import { api } from "@/lib/api"
import { useAgentStore } from "@/stores/agent"

export function SaveAgentButton() {
  const queryClient = useQueryClient()
  const id = useAgentStore((state) => state.id)
  const name = useAgentStore((state) => state.name)
  const draftConfig = useAgentStore((state) => state.draftConfig)

  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch<AgentDraft, UpdateAgentInput>(`/agents/${id}`, {
        body: { name, draftConfig: toServerDraftConfig(draftConfig) },
      }),
    onSuccess: () => {
      toast.success("Agent saved")
      queryClient.invalidateQueries({ queryKey: ["agents", id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Button
      variant="outline"
      disabled={saveMutation.isPending}
      onClick={() => saveMutation.mutate()}
    >
      <SaveIcon />
      Save
    </Button>
  )
}
