import mongoose from "mongoose"

import { User, type UserFields, type UserDoc } from "./user.model"
import { AppError } from "../../errors/AppError"
import { type UserDTO } from "@reparthune/shared"

type CreateUserInput = Omit<UserFields, "createdAt">

export function toUserDTO(user: UserDoc): UserDTO {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString()
  }
}

export async function createUser(data: CreateUserInput): Promise<UserDTO> {
  const user = new User(data)
  try {
    await user.save()
  } catch (error) {
    // index unique sur email : couvre deux inscriptions simultanées avec le même email
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      throw new AppError(
        "Impossible de s'enregistrer",
        409,
        "EMAIL_ALREADY_EXISTS"
      )
    }
    throw error
  }
  return toUserDTO(user)
}

export async function findById(id: string): Promise<UserDTO | null> {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  const user = await User.findById(id)
  return user ? toUserDTO(user) : null
}

export async function findByEmail(email: string): Promise<UserDTO | null> {
  const user = await User.findOne({ email })
  return user ? toUserDTO(user) : null
}

export async function findByEmailWithPassword(email: string): Promise<UserDoc | null> {
  const user = await User.findOne({ email }).select("+hashedPassword")
  return user || null
}