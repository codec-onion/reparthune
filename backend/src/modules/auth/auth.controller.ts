import * as authService from "./auth.service"
import asyncHandler from "../../middlewares/asyncHandler"

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body)
  res.status(201).json(user)
})

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body)
  res.status(200).json(data)
})

export const authMe = asyncHandler(async (req, res) => {
  res.status(200).json("Authentification résussie")
})