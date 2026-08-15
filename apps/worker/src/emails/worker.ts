import { Worker } from "bullmq"

import { connection } from "@/lib/redis"
import { sendOrganizationInvitation } from "./jobs/send-organization-invitation"
import { sendResetPassword } from "./jobs/send-reset-password"
import { sendVerificationOtp } from "./jobs/send-verification-otp"

export const emailsWorker = new Worker(
  "emails",
  async (job) => {
    switch (job.name) {
      case "send-reset-password":
        return sendResetPassword(job.data)
      case "send-verification-otp":
        return sendVerificationOtp(job.data)
      case "send-organization-invitation":
        return sendOrganizationInvitation(job.data)
      default:
        throw new Error(`Unknown job: ${job.name}`)
    }
  },
  { connection }
)
