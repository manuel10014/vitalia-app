import { z } from "zod";

export const clientSchema = z.object({
  businessName: z.string().min(1, "La razón social es obligatoria"),
  taxId: z.string().min(1, "El NIT/Tax ID es obligatorio"),
  contactName: z.string().min(1, "El nombre de contacto es obligatorio"),
  email: z.string().email("Email inválido").or(z.literal("")),
  phone: z.string().min(5, "Teléfono inválido").or(z.literal("")),
  isActive: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
