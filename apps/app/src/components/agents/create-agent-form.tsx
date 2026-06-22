import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { createDefaultAgentConfig } from "@workspace/shared/agent-config/defaults"
import { createAgentRequestSchema } from "@workspace/shared/api/agents/schemas"
import type {
  AgentDraftResponse,
  CreateAgentRequest,
} from "@workspace/shared/api/agents/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/api"

export function CreateAgentForm() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<CreateAgentRequest>({
    resolver: zodResolver(createAgentRequestSchema),
    defaultValues: {
      name: "",
      draftConfig: createDefaultAgentConfig(),
    },
  })

  const createAgentMutation = useMutation({
    mutationFn: (values: CreateAgentRequest) =>
      api.post<AgentDraftResponse, CreateAgentRequest>("/agents", {
        body: values,
      }),
    onSuccess: (agent) => {
      setOpen(false)
      form.reset()
      navigate({
        to: "/agents/$agentId",
        params: { agentId: agent.id },
      })
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        form.reset()
        createAgentMutation.reset()
      }}
    >
      <DialogTrigger>
        <Button>
          <PlusIcon />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create agent</DialogTitle>
          <DialogDescription>Create a new agent</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) =>
            createAgentMutation.mutate(values)
          )}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Agent name"
                    autoComplete="off"
                    disabled={createAgentMutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-8">
            <DialogClose>
              <Button
                variant="outline"
                disabled={createAgentMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createAgentMutation.isPending}>
              {createAgentMutation.isPending ? (
                <Spinner className="mx-8 size-4" />
              ) : (
                "Create agent"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
