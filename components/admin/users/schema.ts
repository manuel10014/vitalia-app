import { z } from "zod";

export const userSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  roleId: z.string().uuid("Selecciona un rol válido"),
  professionalLicense: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;
