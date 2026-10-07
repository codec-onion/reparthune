import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import * as userService from "../users/user.service"
import { AppError } from "../../errors/AppError"
import { env } from "../../config/env"

import type { UserDTO } from "@reparthune/shared"
import type { RegisterInput, LoginInput } from "@reparthune/shared"

// création du hash factice
const bcryptCost = 12
const fakeHash = bcrypt.hashSync("jbdciebf'èç(!§jncjd", bcryptCost)

export async function register(data: RegisterInput): Promise<UserDTO> {
  const existing = await userService.findByEmail(data.email)
  if (existing) {
    throw new AppError(
      "Impossible de s'enregistrer",
      409,
      "EMAIL_ALREADY_EXISTS"
    )
  }

  const hashedPassword = await bcrypt.hash(data.password, bcryptCost)

  const user = {
    email: data.email,
    name: data.name,
    hashedPassword
  }

  return userService.createUser(user)
}

export async function login(data: LoginInput): Promise<{token: string, user: UserDTO}> {
  const user = await userService.findByEmailWithPassword(data.email)
  if (!user) {
    // ajout d'une comparaison de hash pour que le temps de requête soit le même entre un user inexistant et un mdp invalide
    await bcrypt.compare(data.password, fakeHash)
    throw new AppError(
      "Identifiants invalides",
      401,
      "INVALID_CREDENTIALS"
    )
  }

  const isValid = await bcrypt.compare(data.password, user.hashedPassword)
  if(!isValid) {
    throw new AppError(
      "Identifiants invalides",
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