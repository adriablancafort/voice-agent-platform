import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { updateUser } from "@/lib/auth/client"

const userInformationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

type UserInformationValues = z.infer<typeof userInformationSchema>

type UserInformationProps = {
  name: string
  email: string
}

export function UserInformation({ name, email }: UserInformationProps) {
  const queryClient = useQueryClient()

  const form = useForm<UserInformationValues>({
    resolver: zodResolver(userInformationSchema),
    defaultValues: { name },
  })

  const updateUserInformationMutation = useMutation({
    mutationFn: async (values: UserInformationValues) => {
      const result = await updateUser({ name: values.name })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success("Account information updated")
      queryClient.invalidateQueries({ queryKey: ["session"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Account information</FieldLegend>
        <FieldDescription>Update your account information</FieldDescription>
      </FieldSet>

      <form
        onSubmit={form.handleSubmit((values) =>
          updateUserInformationMutation.mutate(values)
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
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  disabled={updateUserInformationMutation.isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" value={email} readOnly />
          </Field>

          <Button
            type="submit"
            disabled={updateUserInformationMutation.isPending}
          >
            {updateUserInformationMutation.isPending ? <Spinner /> : "Save"}
          </Button>
        </FieldGroup>
      </form>
    </FieldGroup>
  )
}
