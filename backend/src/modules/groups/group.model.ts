import mongoose from "mongoose"
import { roles, currencies, sharesLimits } from "@reparthune/shared"

import type { InferSchemaType, HydratedDocument } from "mongoose"
import type { Plain } from "../../types/syncedType"

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
    ...sharesLimits,
    required: true
  },
  role: {
    type: String,
    enum: roles,
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
    ...sharesLimits,
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
    enum: currencies,
    required: true
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
    },
    required: true
  },
  presets: {
    type: [presetSchema],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export type GroupFields = InferSchemaType<typeof groupSchema>
export type MemberFields = InferSchemaType<typeof memberSchema>
export type PresetFields = InferSchemaType<typeof presetSchema>
export type ParticipantFields = InferSchemaType<typeof participantSchema>

export type GroupCreate = Omit<Plain<GroupFields>, "createdAt">
export type MemberCreate = GroupCreate["members"][number]

export type GroupDoc = HydratedDocument<GroupFields>
export type MemberDoc = GroupDoc["members"][number]
export type PresetDoc = GroupDoc["presets"][number]
export type ParticipantDoc = GroupDoc["presets"][number]["participants"][number]

export const Group = mongoose.model("Group", groupSchema)