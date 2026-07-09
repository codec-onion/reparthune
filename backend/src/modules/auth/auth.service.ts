import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import * as userService from "../users/user.service"
import { AppError } from "../../errors/AppError"
import { env } from "../../config/env"

import type { UserDTO, UserRegister, UserLogin } from "@reparthune/shared"

export async function register(data: UserRegister): Promise<UserDTO> {
  const existing = await userService.findByEmail(data.email)
  if (existing) {
    throw new AppError(
      "Impossible de s'enregistrer",
      409,
      "EMAIL_ALREADY_EXISTS"
    )
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = {
    email: data.email,
    name: data.name,
    hashedPassword
  }

  return userService.createUser(user)
}

export async function login(data: UserLogin): Promise<{token: string, user: UserDTO}> {
  const user = await userService.findByEmailWithPassword(data.email)
  if (!user) {
    throw new AppError(
      "Email invalide",
      401,
      "INVALID_CREDENTIALS"
    )
  }

  const isValid = bcrypt.compare(data.password, user.hashedPassword)
  if(!isValid) {
    throw new AppError(
      "Mot de passe invalide",
      401,
      "INVALID_CREDENTIALS"
    )
  }

  const token = jwt.sign(
    {userId: user._id.toString()},
    env.JWT_SECRET,
    {expiresIn: "7d"}
  )

  return {
    token,
    user: {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  }
}