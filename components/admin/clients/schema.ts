import { z } from "zod";

export const clientSchema = z.object({
  businessName: z.string().min(1, "La razón social es obligatoria"),
  taxId: z.string().min(1, "El NIT o Cédula es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  city: z.string().min(1, "Debe seleccionar una ciudad"),
  phone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .regex(/^[0-9+ \-()]+$/, "Formato de teléfono no válido"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Correo electrónico no válido"),
  contactName: z.string().min(1, "El nombre del contacto es obligatorio"),
  contactPosition: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
