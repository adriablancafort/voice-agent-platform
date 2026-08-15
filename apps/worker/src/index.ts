import { batchCallsWorker } from "@/batch-calls/worker"
import { emailsWorker } from "@/emails/worker"
import { connection } from "@/lib/redis"

const workers = [emailsWorker, batchCallsWorker]

for (const worker of workers) {
  worker.on("ready", () => {
    console.log(`[${worker.name}] ready`)
  })

  worker.on("completed", (job) => {
    console.log(`[${worker.name}] completed ${job.name} ${job.id}`)
  })

  worker.on("failed", (job, err) => {
    console.error(`[${worker.name}] failed ${job?.name} ${job?.id}`, err)
  })

  worker.on("error", (err) => {
    console.error(`[${worker.name}] error`, err)
  })
}

async function handleShutdown() {
  await Promise.all(workers.map((worker) => worker.close()))
  await connection.quit()
  process.exit(0)
}

process.on("SIGTERM", () => handleShutdown())
process.on("SIGINT", () => handleShutdown())
