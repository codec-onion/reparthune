import { User } from "./user.model"
import logger from "../../config/logger"

import type { UserBDD } from "@reparthune/shared"
type createUserInput = Omit<UserBDD, "_id" | "createdAt">

export async function createUser (data: createUserInput) {
  const user = new User(data)
  try {
    await user.save()
    return user
  } catch (error) {
    logger.error(error)
    throw error
  }
}