import { Queue } from "bullmq"

import { connection } from "@/lib/redis"

export const emailsQueue = new Queue("emails", { connection })

export const batchCallsQueue = new Queue("batch-calls", { connection })
