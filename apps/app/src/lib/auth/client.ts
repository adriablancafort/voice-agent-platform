import { createAuthClient } from "better-auth/client"
import { emailOTPClient, organizationClient } from "better-auth/client/plugins"

import { ac, admin, member, owner } from "@workspace/shared/auth/permissions"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: env.API_URL,
  plugins: [
    emailOTPClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
})

export const {
  accountInfo,
  changeEmail,
  changePassword,
  deleteUser,
  emailOtp,
  getAccessToken,
  getSession,
  linkSocial,
  listAccounts,
  listSessions,
  organization,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  revokeSessions,
  sendVerificationEmail,
  signIn,
  signOut,
  signUp,
  unlinkAccount,
  updateSession,
  updateUser,
  verifyEmail,
} = authClient
