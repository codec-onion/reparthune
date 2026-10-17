import z from "zod"
import { currencies, sharesLimits } from "../constants/group"

const shares = z.number().min(sharesLimits.min, { error: `Le nombre de parts doit être au minimum de ${sharesLimits.min}` }).max(sharesLimits.max, { error: `Le nombre de parts doit être au maximum de ${sharesLimits.max}` })

const memberSchema = z.object({
  name: z.string().min(1, { error: "Le nom du membre est requis" }),
  shares
})

const periodSchema = z.object({
  start: z.iso.date({
    error: (err) => err.input === undefined
      ? "La date de début doit être fournies"
      : "La date de début doit être au format YYYY-MM-DD"
  }),
  end: z.iso.date({
    error: (err) => err.input === undefined
      ? "La date de fin doit être fournies"
      : "La date de fin doit être au format YYYY-MM-DD"
  })
}, {
  error: "Les dates de début et de fin doivent être fournies"
}).refine((period) => period.end >= period.start, {
  error: "La date de fin ne peut être inférieure à la date de début"
})

export const createGroupSchema = z.object({
  name: z.string({ error: "Le nom du groupe doit être une chaine de caractères" }).min(1, { error: "Le nom du groupe est requis" }),
  description: z.string().nullable().default(null),
  period: periodSchema,
  currency: z.enum(currencies).default("EUR"),
  members: z.array(memberSchema).default([]),
  creator: memberSchema
})

export const updateGroupSchema = z.object({
  name: z.string({ error: "Le nom du groupe doit être une chaine de caractères" }).min(1, { error: "Le nom du groupe est requis" }),
  description: z.string().nullable(),
  period: periodSchema,
}).partial().refine((data) => Object.keys(data).length > 0, {
  error: "Au moins un champ doit être fourni"
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>