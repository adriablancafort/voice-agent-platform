import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

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
import { PasswordInput } from "@workspace/ui/components/password-input"
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
      sipAddress: phoneNumber.sipAddress,
      sipUsername: phoneNumber.sipUsername,
      sipPassword: phoneNumber.sipPassword,
    },
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
            Edit the phone number and its SIP connection
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
              name="sipAddress"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>SIP address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    aria-invalid={fieldState.invalid}
                    placeholder="sip.example.com"
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
              name="sipUsername"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>SIP username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    aria-invalid={fieldState.invalid}
                    placeholder="username"
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
              name="sipPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>SIP password</FieldLabel>
                  <PasswordInput
                    id={field.name}
                    name={field.name}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    disabled={saveMutation.isPending}
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
              <Button variant="outline" disabled={saveMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Spinner className="mx-8" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
