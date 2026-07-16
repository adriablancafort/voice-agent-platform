import { useMutation } from "@tanstack/react-query"
import { DownloadIcon } from "lucide-react"

import type { CallDownloadResponse } from "@workspace/shared/api/calls/types"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/api"

export function DownloadCallsButton() {
  const downloadMutation = useMutation({
    mutationFn: () => api.get<CallDownloadResponse>("/calls/download"),
    onSuccess: (calls) => {
      const blob = new Blob([JSON.stringify(calls, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "calls.json"
      link.click()
      URL.revokeObjectURL(url)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Button
      variant="outline"
      disabled={downloadMutation.isPending}
      onClick={() => downloadMutation.mutate()}
    >
      {downloadMutation.isPending ? (
        <Spinner className="size-4 mx-9" />
      ) : (
        <>
          <DownloadIcon />
          Download
        </>
      )}
    </Button>
  )
}
