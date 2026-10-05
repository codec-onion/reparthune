import express, { type Request, type Response, urlencoded } from "express"
import authRoutes from "./modules/auth/auth.routes"
import { errorMiddleware } from "./middlewares/error.middleware"

const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Coucou")
})
app.use("/auth", authRoutes)

app.use(errorMiddleware)

export default app