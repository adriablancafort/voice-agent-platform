import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { createDefaultAgentConfig } from "@workspace/shared/agent-config/defaults"
import { createAgentFormSchema } from "@workspace/shared/agents/schemas"
import type {
  AgentDraft,
  CreateAgentFormInput,
  CreateAgentInput,
} from "@workspace/shared/agents/types"
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

  const form = useForm<CreateAgentFormInput>({
    resolver: zodResolver(createAgentFormSchema),
    defaultValues: {
      name: "",
    },
  })

  const createAgentMutation = useMutation({
    mutationFn: (payload: CreateAgentInput) =>
      api.post<AgentDraft, CreateAgentInput>("/agents", {
        body: payload,
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

  function handleSubmit(values: CreateAgentFormInput) {
    createAgentMutation.mutate({
      name: values.name,
      draftConfig: createDefaultAgentConfig(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          form.reset()
          createAgentMutation.reset()
        }
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

        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
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
