import mongoose from "mongoose"
import { roles, currencies, sharesLimits } from "@reparthune/shared"

import type { InferSchemaType, HydratedDocument } from "mongoose"
import type { Plain } from "../../types/syncedType"

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
}, { _id: false })

const presetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  participants: [participantSchema]
})

const periodFieldFormat = [/^\d{4}-\d{2}-\d{2}$/, "Le format doit être YYYY-MM-DD"] as const
const periodSchema = new mongoose.Schema({
  start: {
    type: String,
    match: periodFieldFormat,
    required: true
  },
  end: {
    type: String,
    match: periodFieldFormat,
    required: true,
    validate: {
      validator: function (this: { start: string }, end: string) {
        return end >= this.start
      },
      message: "La date de fin ne peut être inférieure à la date de début"
    }
  }
}, { _id: false })

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  period: {
    type: periodSchema,
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

export type GroupCreate = Required<Omit<Plain<GroupFields>, "createdAt">>
export type MemberCreate = Required<GroupCreate["members"][number]>

export type GroupDoc = HydratedDocument<GroupFields>
export type MemberDoc = GroupDoc["members"][number]
export type PresetDoc = GroupDoc["presets"][number]
export type ParticipantDoc = GroupDoc["presets"][number]["participants"][number]

export const Group = mongoose.model("Group", groupSchema)