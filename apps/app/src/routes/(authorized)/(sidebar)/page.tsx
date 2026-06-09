import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/(authorized)/(sidebar)/")({
  beforeLoad: () => {
    throw redirect({ to: "/agents" })
  },
})
