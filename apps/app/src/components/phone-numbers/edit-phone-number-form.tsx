import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import type {
  AgentsListResponse,
  AgentVersionsListResponse,
} from "@workspace/shared/api/agents/types"
import { updatePhoneNumberRequestSchema } from "@workspace/shared/api/phone-numbers/schemas"
import type {
  PhoneNumberListResponse,
  PhoneNumberResponse,
  UpdatePhoneNumberRequest,
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

type EditPhoneNumberFormProps = {
  phoneNumber: PhoneNumberListResponse[number]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPhoneNumberForm({
  phoneNumber,
  open,
  onOpenChange,
}: EditPhoneNumberFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdatePhoneNumberRequest>({
    resolver: zodResolver(updatePhoneNumberRequestSchema),
    defaultValues: {
      number: phoneNumber.number,
      agentId: phoneNumber.agentId,
      agentVersionId: phoneNumber.agentVersionId,
    },
  })

  const selectedAgentId = form.watch("agentId") ?? undefined

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "list"],
    queryFn: () => api.get<AgentsListResponse>("/agents"),
    enabled: open,
  })

  const { data: agentVersions = [] } = useQuery({
    queryKey: ["agents", "versions", selectedAgentId],
    queryFn: () =>
      api.get<AgentVersionsListResponse>(`/agents/${selectedAgentId}/versions`),
    enabled: open && Boolean(selectedAgentId),
  })

  const saveMutation = useMutation({
    mutationFn: (values: UpdatePhoneNumberRequest) =>
      api.patch<PhoneNumberResponse, UpdatePhoneNumberRequest>(
        `/phone-numbers/${phoneNumber.id}`,
        { body: values }
      ),
    onSuccess: () => {
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] })
      queryClient.invalidateQueries({ queryKey: ["agents", "list"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        form.reset()
        saveMutation.reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit phone number</DialogTitle>
          <DialogDescription>
            Edit the phone number or assigned agent and version
          </DialogDescription>
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
                            ? `V${agentVersions.find((version) => version.id === field.value)?.number ?? ""}`
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
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
