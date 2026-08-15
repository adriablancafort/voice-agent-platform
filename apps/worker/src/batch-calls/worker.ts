import { Worker } from "bullmq"

import { connection } from "@/lib/redis"
import { processBatchCall } from "./jobs/process-batch-call"

export const batchCallsWorker = new Worker(
  "batch-calls",
  async (job) => {
    switch (job.name) {
      case "process-batch-call":
        return processBatchCall(job.data)
      default:
        throw new Error(`Unknown job: ${job.name}`)
    }
  },
  { connection }
)
