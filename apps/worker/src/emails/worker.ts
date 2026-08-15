import { Worker } from "bullmq"

import { connection } from "@/lib/redis"

export const emailsWorker = new Worker(
  "emails",
  async (job) => {
    console.log(job)
  },
  { connection }
)
