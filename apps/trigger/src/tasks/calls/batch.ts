import { task } from "@trigger.dev/sdk"

import type { TriggerBatchCallResponse } from "@workspace/shared/api/batch-calls/types"
import { api } from "@/lib/api"

type ProcessBatchCallPayload = {
  batchCallId: string
}

export const processBatchCall = task({
  id: "process-batch-call",
  maxDuration: 3600,
  run: async (payload: ProcessBatchCallPayload) => {
    await api.post<TriggerBatchCallResponse, never>(
      `/batch-calls/${payload.batchCallId}/trigger`,
      {}
    )

    return { batchCallId: payload.batchCallId }
  },
})
