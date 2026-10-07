import * as authService from "./auth.service"
import { getAuthPayload } from "./auth.middleware"

import type { Request, Response } from "express"

export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body)
  res.status(201).json(user)
}

export const login = async (req: Request, res: Response) => {
  const data = await authService.login(req.body)
  res.status(200).json(data)
}

export const authMe = async (req: Request, res: Response) => {
  const authPayload = getAuthPayload(req)

  const user = await authService.getCurrentUser(authPayload.userId)
  res.status(200).json(user)
}