import sendEmail from "@workspace/email/send"
import ResetPasswordEmail from "@workspace/email/templates/auth/reset-password"
import { env } from "@/lib/env"

export type SendResetPasswordPayload = {
  to: string
  name: string
  url: string
}

export async function sendResetPassword(payload: SendResetPasswordPayload) {
  await sendEmail(
    env.EMAIL_FROM,
    payload.to,
    "Reset Password",
    ResetPasswordEmail({
      name: payload.name,
      url: payload.url,
    })
  )
}
