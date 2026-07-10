import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/settings/"
)({
  beforeLoad: () => {
    throw redirect({ to: "/settings/account" })
  },
})
