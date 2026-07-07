import mongoose from "mongoose"
import { env } from "./env"
import logger from "./logger"

export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connecté")
  })

  mongoose.connection.on("error", (err) => {
    logger.error("Erreur MongoDB", { error: err })
  })

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB déconnecté")
  })

  await mongoose.connect(env.MONGO_URI)
}