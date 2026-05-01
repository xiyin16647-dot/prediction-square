import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(3, "账号至少 3 个字符")
  .max(20, "账号最多 20 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "账号只能包含字母、数字和下划线");

export const PasswordSchema = z
  .string()
  .min(6, "密码至少 6 个字符")
  .max(50, "密码最多 50 个字符");

export const RegisterSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
