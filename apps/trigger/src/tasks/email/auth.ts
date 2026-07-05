import { task } from "@trigger.dev/sdk"

import sendEmail from "@workspace/email/send"
import AcceptOrganizationInvitationEmail from "@workspace/email/templates/auth/accept-organization-invitation"
import ResetPasswordEmail from "@workspace/email/templates/auth/reset-password"
import { env } from "@/lib/env"

type sendResetPasswordEmailPayload = {
  to: string
  name: string
  url: string
}

export const sendResetPasswordEmail = task({
  id: "send-reset-password-email",
  maxDuration: 60,
  run: async (payload: sendResetPasswordEmailPayload) => {
    await sendEmail(
      env.EMAIL_FROM,
      payload.to,
      "Reset Password",
      ResetPasswordEmail({
        name: payload.name,
        url: payload.url,
      })
    )
    return { success: true }
  },
})

type sendOrganizationInvitationEmailPayload = {
  to: string
  url: string
  organizationName: string
}

export const sendOrganizationInvitationEmail = task({
  id: "send-organization-invitation-email",
  maxDuration: 60,
  run: async (payload: sendOrganizationInvitationEmailPayload) => {
    await sendEmail(
      env.EMAIL_FROM,
      payload.to,
      "Accept invitation to join " + payload.organizationName,
      AcceptOrganizationInvitationEmail({
        url: payload.url,
        organizationName: payload.organizationName,
      })
    )

    return { success: true }
  },
})
