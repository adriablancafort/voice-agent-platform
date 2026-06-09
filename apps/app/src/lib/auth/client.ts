import { createAuthClient } from "better-auth/client"

import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: env.API_URL,
})

export const {
  accountInfo,
  changeEmail,
  changePassword,
  deleteUser,
  getAccessToken,
  getSession,
  linkSocial,
  listAccounts,
  listSessions,
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
