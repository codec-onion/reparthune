import { z } from "zod"
import 'dotenv/config'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().min(1, "MONGO_URI est requis"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit contenir au moins 32 caractères"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("Variables d'environnement invalides :", z.prettifyError(parsedEnv.error))
  process.exit(1)
}
console.log(parsedEnv)

export const env = parsedEnv.data