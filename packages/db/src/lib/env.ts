import "dotenv/config"

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
}
