import sendEmail from "@workspace/email/send"
import AcceptOrganizationInvitationEmail from "@workspace/email/templates/auth/accept-organization-invitation"
import { env } from "@/lib/env"

export type SendOrganizationInvitationPayload = {
  to: string
  url: string
  organizationName: string
}

export async function sendOrganizationInvitation(
  payload: SendOrganizationInvitationPayload
) {
  await sendEmail(
    env.EMAIL_FROM,
    payload.to,
    "Accept invitation to join " + payload.organizationName,
    AcceptOrganizationInvitationEmail({
      url: payload.url,
      organizationName: payload.organizationName,
    })
  )
}
