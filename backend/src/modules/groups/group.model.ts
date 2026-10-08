import mongoose, { type InferSchemaType, type HydratedDocument } from "mongoose"

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    min: 0.1,
    max: 99,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "member", "readonly"],
    required: true
  }
})

const participantSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  shares: {
    type: Number,
    min: 0.1,
    max: 99,
    required: true
  }
})

const presetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  participants: [participantSchema]
})

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    enum: ["EUR", "USD", "CHF", "GBP", "JPY"],
    default: "EUR"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  members: {
    type: [memberSchema],
    validate: {
      validator: (members: unknown[]) => members.length > 0,
      message: "Un groupe doit contenir au moins un membre"
    }
  },
  presets: [presetSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export type GroupFields = InferSchemaType<typeof groupSchema>
export type GroupDoc = HydratedDocument<GroupFields>

export const Group = mongoose.model("Group", groupSchema)