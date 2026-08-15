import "dotenv/config"

export const env = {
  REDIS_URL: process.env.REDIS_URL ?? "",
}
