import mongoose from "mongoose"
const { Schema } = mongoose

import type { UserBDD } from "@reparthune/shared"

const userSchema = new Schema<UserBDD>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  hashedPassword: {
    type: String,
    required: true,
    select: false
  },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

export const User = mongoose.model<UserBDD>('User', userSchema)