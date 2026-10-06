// shared/src/schemas/auth.schema.ts
import z from 'zod';

export const passwordSchema = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  .max(24, { message: 'Le mot de passe ne doit pas dépasser 24 caractères' })
  .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
  .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule' })
  .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  .regex(/[^A-Za-z0-9]/, { message: 'Le mot de passe doit contenir au moins un caractère spécial' })
  .regex(/^\S*$/, { message: 'Le mot de passe ne doit pas contenir d\'espaces' })

export const registerSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;