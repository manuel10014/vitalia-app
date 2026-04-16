import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  specsArray: z.array(
    z.object({
      key: z.string().min(1, "Propiedad requerida"),
      value: z.string().min(1, "Valor requerido"),
    }),
  ),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
