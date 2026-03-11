import * as z from "zod";

export const clientSchema = z.object({
  businessName: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  taxId: z.string().optional().nullable(),
  isActive: z.boolean(),
  email: z.string().email("Email inválido").or(z.literal("")),
  phone: z.string().min(9, "Teléfono demasiado corto").or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
