import z from "zod"
import { currency, role, sharesLimits } from "../constants/group"

const shares = z.number().min(sharesLimits.min).max(sharesLimits.max)

const memberDTOSchema = z.object({
  userId: z.string().min(1).nullable(),
  name: z.string().min(1),
  shares,
  role: z.enum(role)
})

const participantDTOSchema = z.object({
  memberId: z.string().min(1),
  shares
})

const presetDTOSchema = z.object({
  name: z.string().min(1),
  participants: z.array(participantDTOSchema).nonempty()
})

export const groupDTOSchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1),
  currency: z.enum(currency).default("EUR"),
  createdBy: z.string().min(1),
  members: z.array(memberDTOSchema).nonempty(),
  presets: z.array(presetDTOSchema),
  createdAt: z.string().min(1)
})

export type GroupeDTO = z.infer<typeof groupDTOSchema>