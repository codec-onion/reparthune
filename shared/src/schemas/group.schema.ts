import z from "zod"
import { currencies, sharesLimits } from "../constants/group"

const shares = z.number().min(sharesLimits.min, { error: `Le nombre de parts doit être au minimum de ${sharesLimits.min}` }).max(sharesLimits.max, { error: `Le nombre de parts doit être au maximum de ${sharesLimits.max}` })
const memberSchema = z.object({
  name: z.string().min(1, { error: "Le nom du membre est requis" }),
  shares
})

export const createGroupSchema = z.object({
  name: z.string().min(1, { error: "Le nom du groupe est requis" }),
  currency: z.enum(currencies).default("EUR"),
  members: z.array(memberSchema),
  creator: memberSchema
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>