import { tasks } from "@trigger.dev/sdk"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"

import { db } from "@workspace/db/client"
import * as schema from "@workspace/db/schema/auth"
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
    async sendResetPassword(data) {
      await tasks.trigger("send-reset-password-email", {
        to: data.user.email,
        name: data.user.name,
        url: data.url,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    organization({
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
  telemetry: {
    enabled: false,
  },
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  secret: env.BETTER_AUTH_SECRET,
})
