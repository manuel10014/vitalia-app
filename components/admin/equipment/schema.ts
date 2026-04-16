import { z } from "zod";

export const equipmentSchema = z
  .object({
    name: z.string().min(1, "El nombre del instrumento es obligatorio"),
    brand: z.string().min(1, "La marca es obligatoria"),
    model: z.string().min(1, "El modelo es obligatorio"),
    serialNumber: z.string().min(1, "El número de serie es obligatorio"),

    lastCalibrationAt: z.coerce.date({
      message: "La fecha de calibración es obligatoria",
    }),

    calibrationDueAt: z.coerce.date({
      message: "La fecha de vencimiento es obligatoria",
    }),

    certificateNumber: z
      .string()
      .min(1, "El número de certificado es obligatorio"),
    certificateUrl: z
      .string()
      .url("Debe ser una URL válida")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      return data.calibrationDueAt > data.lastCalibrationAt;
    },
    {
      message: "La próxima calibración debe ser posterior a la última",
      path: ["calibrationDueAt"],
    },
  );

export type EquipmentFormData = z.infer<typeof equipmentSchema>;
