import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(20),
  GITHUB_OAUTH_REDIRECT_URI: z.string().url(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().min(1),
  GITHUB_OAUTH_CLIENT_ID: z.string().min(1)
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error("❌ Error: Invalid enviroment variables", _env.error.format())

  throw new Error("Invalid enviroment variables")
}

export const env = _env.data
