import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UploadIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { publishAgentFormSchema } from "@workspace/shared/agents/schemas"
import type {
  AgentVersionSummary,
  PublishAgentFormInput,
  PublishAgentInput,
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
import { Textarea } from "@workspace/ui/components/textarea"
import { api } from "@/lib/api"
import { useAgentStore } from "@/stores/agent"

export function PublishAgentForm() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const id = useAgentStore((state) => state.id)
  const versions = useAgentStore((state) => state.versions)
  const nextVersionNumber =
    versions.length > 0 ? Math.max(...versions.map((v) => v.number)) + 1 : 1

  const form = useForm<PublishAgentFormInput>({
    resolver: zodResolver(publishAgentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const publishAgentMutation = useMutation({
    mutationFn: (payload: PublishAgentInput) =>
      api.post<AgentVersionSummary, PublishAgentInput>(
        `/agents/${id}/publish`,
        {
          body: payload,
        }
      ),
    onSuccess: (publishedVersion) => {
      setOpen(false)
      form.reset()
      toast.success(`V${publishedVersion.number} published`)
      queryClient.invalidateQueries({ queryKey: ["agents", id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function handleSubmit(values: PublishAgentFormInput) {
    publishAgentMutation.mutate({
      name: values.name?.trim() ? values.name.trim() : undefined,
      description: values.description?.trim()
        ? values.description.trim()
        : undefined,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        publishAgentMutation.reset()
      }}
    >
      <DialogTrigger>
        <Button disabled={!id}>
          <UploadIcon />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish V{nextVersionNumber}</DialogTitle>
          <DialogDescription>Publish a new agent version</DialogDescription>
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
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                    placeholder="Version name (optional)"
                    autoComplete="off"
                    disabled={publishAgentMutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                    placeholder="Version description (optional)"
                    disabled={publishAgentMutation.isPending}
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
                disabled={publishAgentMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={publishAgentMutation.isPending}>
              {publishAgentMutation.isPending ? (
                <Spinner className="mx-5 size-4" />
              ) : (
                "Publish"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
