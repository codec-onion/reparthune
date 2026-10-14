import express from "express"

import authRoutes from "./modules/auth/auth.routes"
import groupRoutes from "./modules/groups/group.routes"

import { errorMiddleware } from "./middlewares/error.middleware"

import type { Request, Response }  from "express"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Coucou")
})
app.use("/auth", authRoutes)
app.use("/group", groupRoutes)

app.use(errorMiddleware)

export default app