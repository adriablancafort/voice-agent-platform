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
import { deleteUser } from "@/lib/auth/client"

const deleteAccountSchema = z.object({
  email: z.email("Enter a valid email address"),
})

type DeleteAccountValues = z.infer<typeof deleteAccountSchema>

type DeleteAccountProps = {
  email: string
}

export function DeleteAccount({ email }: DeleteAccountProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<DeleteAccountValues>({
    resolver: zodResolver(
      deleteAccountSchema.superRefine((values, ctx) => {
        if (values.email !== email) {
          ctx.addIssue({
            code: "custom",
            message: "Email does not match your account",
            path: ["email"],
          })
        }
      })
    ),
    defaultValues: {
      email: "",
    },
  })

  const enteredEmail = form.watch("email")

  const deleteAccountMutation = useMutation({
    mutationFn: async (_values: DeleteAccountValues) => {
      const result = await deleteUser()
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success("Account deleted")
      queryClient.clear()
      navigate({ to: "/signin" })
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
          deleteAccountMutation.reset()
        }}
      >
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Delete account</ItemTitle>
            <ItemDescription>Permanently delete your account</ItemDescription>
          </ItemContent>
          <ItemActions>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive">
                  <Trash2Icon className="size-4" />
                  Delete account
                </Button>
              }
            />
          </ItemActions>
        </Item>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address below to confirm
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            onSubmit={form.handleSubmit((values) =>
              deleteAccountMutation.mutate(values)
            )}
            noValidate
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder={email}
                      aria-invalid={fieldState.invalid}
                      disabled={deleteAccountMutation.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <AlertDialogFooter className="mt-8">
              <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                type="submit"
                disabled={
                  deleteAccountMutation.isPending || enteredEmail !== email
                }
              >
                {deleteAccountMutation.isPending ? (
                  <Spinner className="mx-3 size-4" />
                ) : (
                  "Delete account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </FieldGroup>
  )
}
