import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import type {
  AgentListResponse,
  AgentVersionsListResponse,
} from "@workspace/shared/api/agents/types"
import { createPhoneNumberRequestSchema } from "@workspace/shared/api/phone-numbers/schemas"
import type {
  CreatePhoneNumberRequest,
  PhoneNumberResponse,
} from "@workspace/shared/api/phone-numbers/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/api"

export function AddPhoneNumberForm() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreatePhoneNumberRequest>({
    resolver: zodResolver(createPhoneNumberRequestSchema),
    defaultValues: {
      number: "",
      agentId: null,
      agentVersionId: null,
    },
  })

  const selectedAgentId = form.watch("agentId") ?? undefined

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<AgentListResponse>("/agents"),
    enabled: open,
  })

  const { data: agentVersions = [] } = useQuery({
    queryKey: ["agents", selectedAgentId, "versions"],
    queryFn: () =>
      api.get<AgentVersionsListResponse>(`/agents/${selectedAgentId}/versions`),
    enabled: open && Boolean(selectedAgentId),
  })

  const saveMutation = useMutation({
    mutationFn: (values: CreatePhoneNumberRequest) =>
      api.post<PhoneNumberResponse, CreatePhoneNumberRequest>(
        "/phone-numbers",
        {
          body: values,
        }
      ),
    onSuccess: () => {
      setOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] })
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        form.reset()
        saveMutation.reset()
      }}
    >
      <DialogTrigger>
        <Button>
          <PlusIcon />
          Add phone number
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add phone number</DialogTitle>
          <DialogDescription>Add a new phone number</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="+14155551234"
                    autoComplete="off"
                    disabled={saveMutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="agentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Agent</FieldLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) => {
                      const agentId = value === "none" ? null : value
                      field.onChange(agentId)
                      form.setValue("agentVersionId", null)
                    }}
                    disabled={saveMutation.isPending}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full text-foreground"
                    >
                      <SelectValue>
                        {field.value
                          ? agents.find((agent) => agent.id === field.value)
                              ?.name
                          : "No agent"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No agent</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="agentVersionId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Version</FieldLabel>
                  <Select
                    value={
                      selectedAgentId ? (field.value ?? "draft") : "no-version"
                    }
                    onValueChange={(value) =>
                      field.onChange(value === "draft" ? null : value)
                    }
                    disabled={!selectedAgentId || saveMutation.isPending}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full text-foreground"
                    >
                      <SelectValue>
                        {!selectedAgentId
                          ? "No version"
                          : field.value
                            ? `V${
                                agentVersions.find(
                                  (version) => version.id === field.value
                                )?.number ?? ""
                              }`
                            : "Latest (draft)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Latest (draft)</SelectItem>
                      {agentVersions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          V{version.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-8">
            <DialogClose>
              <Button variant="outline" disabled={saveMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Spinner className="mx-8 size-4" />
              ) : (
                "Add phone number"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
