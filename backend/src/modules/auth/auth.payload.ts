import z from "zod"

export const authPayloadSchema = z.object({
  userId: z.string()
})

export type AuthPayload = z.infer<typeof authPayloadSchema>