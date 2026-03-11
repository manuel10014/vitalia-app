"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useEquipment } from "@/hooks/useEquiment";
import { MeasurementEquipment } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Upload, ShieldCheck, Plus, Loader2 } from "lucide-react";
import styles from "./CreateEquimentModal.module.css";

// ✅ Definimos el tipo del formulario incluyendo el certificado como FileList
type EquipmentFormData = Omit<
  MeasurementEquipment,
  "id" | "status" | "createdAt" | "updatedAt" | "certificateUrl"
> & {
  certificateUrl: FileList; // Ahora watch y register reconocerán este campo
};

export function CreateEquipmentModal() {
  const [open, setOpen] = useState(false);
  const { createEquipment } = useEquipment();

  const { register, handleSubmit, reset, control } =
    useForm<EquipmentFormData>();

  const selectedFile = useWatch({
    control,
    name: "certificateUrl",
  });

  const onSubmit = (data: EquipmentFormData) => {
    const payload = {
      ...data,
      certificateUrl: data.certificateUrl?.[0]?.name || "",
    };

    createEquipment.mutate(payload, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
          <Plus size={18} /> Nuevo Equipo de Medición
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Zap className="text-blue-600" fill="currentColor" size={24} />
            Registro de Herramental
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Nombre del Equipo</Label>
            <Input
              {...register("name", { required: true })}
              placeholder="Ej: Telurímetro Digital de 4 Polos"
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Marca</Label>
              <Input
                {...register("brand", { required: true })}
                placeholder="Ej: Megger"
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Modelo</Label>
              <Input
                {...register("model", { required: true })}
                placeholder="Ej: DET2/3"
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Número de Serie</Label>
              <Input
                {...register("serialNumber", { required: true })}
                placeholder="SN-XXXXXX"
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Código Interno Vitalia</Label>
              <Input
                {...register("internalCode", { required: true })}
                placeholder="V-EQU-00"
              />
            </div>
          </div>

          <div className={styles.calibrationSection}>
            <h3 className={styles.sectionTitle}>
              <ShieldCheck size={18} /> Trazabilidad de Calibración
            </h3>

            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Última Calibración</Label>
                <Input
                  type="date"
                  {...register("lastCalibration", { required: true })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Vencimiento</Label>
                <Input
                  type="date"
                  {...register("nextCalibration", { required: true })}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className={styles.label}>
                Certificado de Calibración (PDF)
              </Label>
              <div
                className={`${styles.fileUpload} ${selectedFile?.length ? "border-blue-500 bg-blue-50" : ""}`}
              >
                <input
                  type="file"
                  id="cert"
                  className="hidden"
                  accept=".pdf"
                  {...register("certificateUrl")}
                />
                <label
                  htmlFor="cert"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload
                    size={24}
                    className={
                      selectedFile?.length ? "text-blue-700" : "text-blue-600"
                    }
                  />
                  <span className="text-sm font-medium">
                    {/* ✅ TS ahora permite acceder a [0] porque sabe que es un FileList */}
                    {selectedFile && selectedFile.length > 0
                      ? selectedFile[0].name
                      : "Haz clic para subir el certificado"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Formato PDF máximo 5MB
                  </span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 h-11 font-bold"
              disabled={createEquipment.isPending}
            >
              {createEquipment.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  REGISTRANDO...
                </>
              ) : (
                "REGISTRAR EQUIPO TÉCNICO"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
