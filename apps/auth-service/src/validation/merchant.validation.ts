import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

// All optional at schema level — controller validates the combination
export const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;