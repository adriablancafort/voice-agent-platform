import { serve } from "@hono/node-server"
import api from "@/api"
import { env } from "@/lib/env"

serve(
  {
    fetch: api.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
