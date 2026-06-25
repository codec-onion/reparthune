import express, { type Request, type Response, urlencoded } from "express"
import { env } from "./config/env"
// import type { User } from "@reparthune/shared"


const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Coucou")
})

const PORT = env.PORT || 8081

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})