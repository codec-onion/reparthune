import z from "zod"

export const userDTOSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, { error: "Le nom est requis" }),
  email: z.email({ error: "Format d'email non valide" }),
  createdAt: z.iso.datetime()
})

export type UserDTO = z.infer<typeof userDTOSchema>