import type { ErrorComponentProps } from "@tanstack/react-router"

export function RouteErrorBoundary({ error }: ErrorComponentProps) {
  return (
    <div className="text-center pt-3 text-destructive">
      <div>{error.message}</div>
    </div>
  )
}
