import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "@/lib/env"
import { agentRoutes } from "@/routes/agents"
import { tokenRoutes } from "@/routes/token"

const api = new Hono()

api.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  })
)

if (env.NODE_ENV !== "production") {
  api.use(logger())
}

api.route("/agents", agentRoutes)
api.route("/token", tokenRoutes)

export default api
