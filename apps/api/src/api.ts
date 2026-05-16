import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "@/lib/env"

const api = new Hono()

api.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  })
)

api.use(logger())

api.get("/", (c) => {
  return c.text("Hello Hono!")
})

export default api
