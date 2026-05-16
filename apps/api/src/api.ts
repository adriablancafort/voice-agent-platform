import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "@/lib/env"
import { tokenRoutes } from "@/routes/token"

const api = new Hono()

api.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  })
)

api.use(logger())

api.route("/token", tokenRoutes)

export default api
