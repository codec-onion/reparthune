import * as authService from "./auth.service"

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
  res.status(200).json("Authentification résussie")
}