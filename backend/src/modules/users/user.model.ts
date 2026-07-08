// backend/src/modules/users/user.model.ts
import mongoose, { Schema, Document, Types } from "mongoose"
import type { UserBDD } from "@reparthune/shared"

export interface UserDocument extends Document<Types.ObjectId>, Omit<UserBDD, "_id"> {}

const userSchema = new Schema<UserDocument>({
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
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const User = mongoose.model<UserDocument>('User', userSchema)