// backend/src/modules/users/user.model.ts
import mongoose, { Schema, type InferSchemaType, type HydratedDocument} from "mongoose"

const userSchema = new Schema ({
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

export type UserFields = InferSchemaType<typeof userSchema>
export type UserDoc = HydratedDocument<UserFields>

export const User = mongoose.model('User', userSchema)