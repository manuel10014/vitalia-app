import * as z from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  code: z.string().min(2, "Código obligatorio"),
  clientId: z.string().uuid("Seleccione un cliente"),
  isActive: z.boolean(),
  geoLocation: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional()
    .nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
