import { User, type UserDocument } from "./user.model"

import type { UserBDD, UserDTO } from "@reparthune/shared"
type createUserInput = Omit<UserBDD, "_id" | "createdAt">

function toUserDTO(user: UserDocument): UserDTO {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  }
}

export async function createUser(data: createUserInput): Promise<UserDTO> {
  const user = new User(data)
  await user.save()
  return toUserDTO(user)
}

export async function findByEmail(email: string): Promise<UserDTO | null> {
  const user = await User.findOne({ email })
  return user ? toUserDTO(user) : null
}

export async function findByEmailWithPassword(email: string): Promise<UserDocument | null> {
  const user = User.findOne({ email }).select("+hashedPassword")
  return user || null
}