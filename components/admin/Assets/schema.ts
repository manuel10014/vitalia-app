import { z } from "zod";

export const assetSchema = z.object({
  tagId: z.string().min(1, "El Tag ID es obligatorio"),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  categoryId: z.string().uuid("Seleccione una categoría válida"),
  projectId: z.string().uuid("Seleccione un proyecto válido"),
  locationDescription: z.string().optional(),
  specsArray: z.array(
    z.object({
      key: z.string().min(1, "La clave es obligatoria"),
      value: z.string().min(1, "El valor es obligatorio"),
    }),
  ),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
