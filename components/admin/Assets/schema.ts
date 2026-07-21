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
  // Solo se usa al editar — un activo nuevo siempre nace OPERATIONAL en el
  // backend (default de Prisma), así que el campo va oculto en creación.
  status: z
    .enum(["OPERATIONAL", "MAINTENANCE", "DECOMMISSIONED"])
    .optional(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
