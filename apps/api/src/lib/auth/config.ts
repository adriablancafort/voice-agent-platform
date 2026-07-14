import { tasks } from "@trigger.dev/sdk"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { emailOTP, organization } from "better-auth/plugins"

import { db } from "@workspace/db/client"
import * as schema from "@workspace/db/schema/auth"
import { ac, admin, member, owner } from "@workspace/shared/auth/permissions"
import { env } from "@/lib/env"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword(data) {
      await tasks.trigger("send-reset-password-email", {
        to: data.user.email,
        name: data.user.name,
        url: data.url,
      })
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      rateLimit: {
        window: 300,
        max: 3,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await tasks.trigger("send-verification-otp-email", {
            to: email,
            otp,
          })
        }
      },
    }),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${env.FRONTEND_URL}/join-organization?invitationId=${data.id}&email=${encodeURIComponent(data.email)}`

        await tasks.trigger("send-organization-invitation-email", {
          to: data.email,
          url: inviteLink,
          organizationName: data.organization.name,
        })
      },
    }),
  ],
  rateLimit: {
    window: 60,
    max: 100,
  },
  telemetry: {
    enabled: false,
  },
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  secret: env.BETTER_AUTH_SECRET,
})
