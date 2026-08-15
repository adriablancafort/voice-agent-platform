import sendEmail from "@workspace/email/send"
import VerificationOtpEmail from "@workspace/email/templates/auth/verification-otp"
import { env } from "@/lib/env"

export type SendVerificationOtpPayload = {
  to: string
  otp: string
}

export async function sendVerificationOtp(payload: SendVerificationOtpPayload) {
  await sendEmail(
    env.EMAIL_FROM,
    payload.to,
    "Verify your email",
    VerificationOtpEmail({
      otp: payload.otp,
    })
  )
}
