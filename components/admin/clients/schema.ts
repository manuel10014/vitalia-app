import { z } from "zod";

export const clientSchema = z.object({
  businessName: z.string().min(1, "La razón social es obligatoria"),
  taxId: z.string().min(1, "El NIT es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  state: z.string().min(1, "El departamento es obligatorio"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  contactName: z.string().min(1, "El nombre de contacto es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  isActive: z.boolean(),
  contactPosition: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
