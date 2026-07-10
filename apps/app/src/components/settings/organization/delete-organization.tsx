import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Trash2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/item"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { organization } from "@/lib/auth/client"

const deleteOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

type DeleteOrganizationValues = z.infer<typeof deleteOrganizationSchema>

type DeleteOrganizationProps = {
  organizationId: string
  name: string
}

export function DeleteOrganization({
  organizationId,
  name,
}: DeleteOrganizationProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<DeleteOrganizationValues>({
    resolver: zodResolver(
      deleteOrganizationSchema.superRefine((values, ctx) => {
        if (values.name !== name) {
          ctx.addIssue({
            code: "custom",
            message: "Name does not match this organization",
            path: ["name"],
          })
        }
      })
    ),
    defaultValues: {
      name: "",
    },
  })

  const enteredName = form.watch("name")

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (_values: DeleteOrganizationValues) => {
      const result = await organization.delete({ organizationId })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: async () => {
      toast.success("Organization deleted")
      await queryClient.refetchQueries()
      navigate({ to: "/select-organization" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend className="mb-0">Danger zone</FieldLegend>
      </FieldSet>

      <AlertDialog
        onOpenChange={() => {
          form.reset()
          deleteOrganizationMutation.reset()
        }}
      >
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Delete organization</ItemTitle>
            <ItemDescription>
              Permanently delete this organization
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive">
                  <Trash2Icon className="size-4" />
                  Delete organization
                </Button>
              }
            />
          </ItemActions>
        </Item>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the organization name below to confirm
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            onSubmit={form.handleSubmit((values) =>
              deleteOrganizationMutation.mutate(values)
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
                      autoComplete="organization"
                      placeholder={name}
                      aria-invalid={fieldState.invalid}
                      disabled={deleteOrganizationMutation.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <AlertDialogFooter className="mt-8">
              <AlertDialogCancel
                disabled={deleteOrganizationMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                type="submit"
                disabled={
                  deleteOrganizationMutation.isPending || enteredName !== name
                }
              >
                {deleteOrganizationMutation.isPending ? (
                  <Spinner className="mx-5 size-4" />
                ) : (
                  "Delete organization"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </FieldGroup>
  )
}
