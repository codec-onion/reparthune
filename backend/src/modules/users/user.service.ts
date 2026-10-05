import { User, type UserFields, type UserDoc } from "./user.model"
import { type UserDTO } from "@reparthune/shared"

type CreateUserInput = Omit<UserFields, "createdAt">

function toUserDTO(user: UserDoc): UserDTO {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  }
}

export async function createUser(data: CreateUserInput): Promise<UserDTO> {
  const user = new User(data)
  await user.save()
  return toUserDTO(user)
}

export async function findByEmail(email: string): Promise<UserDTO | null> {
  const user = await User.findOne({ email })
  return user ? toUserDTO(user) : null
}

export async function findByEmailWithPassword(email: string): Promise<UserDoc | null> {
  const user = await User.findOne({ email }).select("+hashedPassword")
  return user || null
}