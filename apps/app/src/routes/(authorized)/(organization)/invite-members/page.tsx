import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { XIcon } from "lucide-react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { organization } from "@/lib/auth/client"
import { fullOrganizationQueryOptions } from "@/lib/auth/organization"

function inviteMember(email: string) {
  return new Promise<void>((resolve) => {
    organization.inviteMember(
      {
        email,
        role: "member",
      },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${email}`)
          resolve()
        },
        onError: (ctx) => {
          toast.error(`${email}: ${ctx.error.message}`)
          resolve()
        },
      }
    )
  })
}

export const Route = createFileRoute(
  "/(authorized)/(organization)/invite-members/"
)({
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: activeOrganization } = useQuery(fullOrganizationQueryOptions())

  const inviteMembersFormSchema = z.object({
    emails: z
      .array(
        z.object({
          address: z.email("Enter a valid email address"),
        })
      )
      .min(1, "Add at least one email address.")
      .max(5, "You can add up to 5 email addresses."),
  })

  type InviteMembersFormValues = z.infer<typeof inviteMembersFormSchema>

  const form = useForm<InviteMembersFormValues>({
    resolver: zodResolver(inviteMembersFormSchema),
    defaultValues: {
      emails: [{ address: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emails",
  })

  async function handleInviteMembers(values: InviteMembersFormValues) {
    await Promise.all(values.emails.map(({ address }) => inviteMember(address)))
    await queryClient.invalidateQueries({ queryKey: ["full-organization"] })
    navigate({ to: "/" })
  }

  return (
    <>
      <title>Invite members</title>
      <div className="flex h-screen w-full items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Invite members</CardTitle>
            <CardDescription>
              Send email invitations to join {activeOrganization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleInviteMembers)} noValidate>
              <FieldGroup>
                <FieldGroup className="gap-4">
                  {fields.map((field, index) => (
                    <Controller
                      key={field.id}
                      name={`emails.${index}.address`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id={field.name}
                              type="email"
                              placeholder="name@example.com"
                              autoComplete={index === 0 ? "email" : "off"}
                              aria-invalid={fieldState.invalid}
                              disabled={form.formState.isSubmitting}
                            />
                            {fields.length > 1 && (
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => remove(index)}
                                  disabled={form.formState.isSubmitting}
                                  aria-label={`Remove email ${index + 1}`}
                                >
                                  <XIcon />
                                </InputGroupButton>
                              </InputGroupAddon>
                            )}
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  ))}

                  {fields.length < 5 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => append({ address: "" })}
                      disabled={form.formState.isSubmitting}
                    >
                      Add email address
                    </Button>
                  )}
                </FieldGroup>

                {form.formState.errors.emails?.root && (
                  <FieldError errors={[form.formState.errors.emails.root]} />
                )}

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Spinner /> : "Invite members"}
                </Button>

                <Button render={<Link to="/" />} variant="ghost">
                  Skip for now
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
