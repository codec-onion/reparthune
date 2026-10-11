import z from 'zod';
import { userDTOSchema } from './user.schema';


export const passwordSchema = z
  .string()
  .min(8, { error: 'Le mot de passe doit contenir au moins 8 caractères' })
  .max(24, { error: 'Le mot de passe ne doit pas dépasser 24 caractères' })
  .regex(/[A-Z]/, { error: 'Le mot de passe doit contenir au moins une majuscule' })
  .regex(/[a-z]/, { error: 'Le mot de passe doit contenir au moins une minuscule' })
  .regex(/[0-9]/, { error: 'Le mot de passe doit contenir au moins un chiffre' })
  .regex(/[^A-Za-z0-9]/, { error: 'Le mot de passe doit contenir au moins un caractère spécial' })
  .regex(/^\S*$/, { error: 'Le mot de passe ne doit pas contenir d\'espaces' })

export const registerSchema = userDTOSchema
  .pick({email: true, name: true})
  .extend({password: passwordSchema})

export const loginSchema = userDTOSchema
  .pick({email: true})
  .extend({password: z.string().min(1, { error: 'Le mot de passe est requis' })})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>