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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importante
import { Zap, Upload, ShieldCheck, Plus, Loader2 } from "lucide-react";
import styles from "./CreateEquimentModal.module.css";

type EquipmentFormData = Omit<
  MeasurementEquipment,
  "id" | "status" | "createdAt" | "updatedAt" | "certificateUrl"
> & {
  certificateUrl: FileList;
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
    // ✅ CORRECCIÓN: Para enviar archivos DEBES usar FormData
    const formData = new FormData();

    // Agregamos los campos de texto
    formData.append("name", data.name);
    formData.append("brand", data.brand);
    formData.append("model", data.model);
    formData.append("serialNumber", data.serialNumber);
    formData.append("internalCode", data.internalCode);
    formData.append("lastCalibration", data.lastCalibration);
    formData.append("nextCalibration", data.nextCalibration);

    // Agregamos el archivo real, no solo el nombre
    if (data.certificateUrl && data.certificateUrl[0]) {
      formData.append("file", data.certificateUrl[0]);
    }

    // Enviamos el formData completo
    createEquipment.mutate(formData, {
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

      {/* ✅ CORRECCIÓN VISUAL: Añadimos altura máxima y scroll */}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Zap className="text-blue-600" fill="currentColor" size={24} />
            Registro de Herramental
          </DialogTitle>
        </DialogHeader>

        {/* ✅ ScrollArea para que el formulario no se corte */}
        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <form
            id="equipment-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 pb-6"
          >
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Nombre del Equipo</Label>
              <Input
                {...register("name", { required: true })}
                placeholder="Ej: Hipot VLF"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Marca</Label>
                <Input {...register("brand", { required: true })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Modelo</Label>
                <Input {...register("model", { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Número de Serie</Label>
                <Input {...register("serialNumber", { required: true })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Código Interno</Label>
                <Input {...register("internalCode", { required: true })} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-blue-700">
                <ShieldCheck size={18} /> Trazabilidad de Calibración
              </h3>

              <div className="grid grid-cols-2 gap-4">
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
                <Label className={styles.label}>Certificado PDF</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-white transition-colors">
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
                    <Upload size={24} className="text-blue-600" />
                    <span className="text-sm">
                      {selectedFile?.[0]
                        ? selectedFile[0].name
                        : "Seleccionar archivo PDF"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Footer fijo fuera del scroll */}
        <div className="p-6 border-t bg-slate-50 rounded-b-lg">
          <Button
            type="submit"
            form="equipment-form"
            className="w-full bg-blue-600 h-11 font-bold"
            disabled={createEquipment.isPending}
          >
            {createEquipment.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "REGISTRAR EQUIPO TÉCNICO"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
