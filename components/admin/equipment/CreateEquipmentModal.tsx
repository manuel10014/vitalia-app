"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useEquipment } from "@/hooks/useEquipment";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Upload, ShieldCheck, Plus, Loader2, Save } from "lucide-react";
import styles from "./CreateEquimentModal.module.css";
import { toast } from "sonner";

// Tipado del formulario adaptado a los nombres de Prisma
type EquipmentFormData = {
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  internalCode: string;
  lastCalibrationAt: string;
  calibrationDueAt: string;
  certificateUrl: FileList;
};

interface CreateEquipmentModalProps {
  equipmentToEdit?: MeasurementEquipment | null;
  onClose?: () => void;
}

export function CreateEquipmentModal({
  equipmentToEdit,
  onClose,
}: CreateEquipmentModalProps) {
  const [open, setOpen] = useState(false);
  const { createEquipment, updateEquipment } = useEquipment();
  const isEditing = !!equipmentToEdit;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>();

  const selectedFile = useWatch({
    control,
    name: "certificateUrl",
  });

  useEffect(() => {
    if (equipmentToEdit) {
      reset({
        name: equipmentToEdit.name,
        brand: equipmentToEdit.brand || "",
        model: equipmentToEdit.model || "",
        serialNumber: equipmentToEdit.serialNumber || "",
        internalCode: equipmentToEdit.internalCode || "",
        lastCalibrationAt: equipmentToEdit.lastCalibrationAt
          ? new Date(equipmentToEdit.lastCalibrationAt)
              .toISOString()
              .split("T")[0]
          : "",
        calibrationDueAt: equipmentToEdit.calibrationDueAt
          ? new Date(equipmentToEdit.calibrationDueAt)
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [equipmentToEdit, reset]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      if (onClose) onClose();
    }
    setOpen(newOpen);
  };

  const onInvalid = () => {
    toast.error("Por favor, completa los campos obligatorios");
  };

  const onSubmit = (data: EquipmentFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("brand", data.brand);
    formData.append("model", data.model);
    formData.append("serialNumber", data.serialNumber);
    formData.append("internalCode", data.internalCode);
    formData.append("lastCalibrationAt", data.lastCalibrationAt);
    formData.append("calibrationDueAt", data.calibrationDueAt);

    if (data.certificateUrl?.[0]) {
      formData.append("file", data.certificateUrl[0]);
    }

    if (isEditing && equipmentToEdit) {
      updateEquipment.mutate(
        { id: equipmentToEdit.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Equipo actualizado");
            handleOpenChange(false);
          },
        },
      );
    } else {
      createEquipment.mutate(formData, {
        onSuccess: () => {
          toast.success("Equipo registrado");
          handleOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={18} /> Nuevo Equipo de Medición
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={`${styles.dialogContent} sm:max-w-[600px] border-none shadow-2xl`}
      >
        {/* HEADER FIJO */}
        <DialogHeader className={styles.header}>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
            <Zap className="text-blue-600" fill="currentColor" size={24} />
            {isEditing ? "Editar equipo" : "Registro de equipo"}
          </DialogTitle>
        </DialogHeader>

        {/* ÁREA DE SCROLL (Flex-1) */}
        <ScrollArea className={styles.scrollContainer}>
          <div className="px-6">
            <form
              id="equipment-form"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className={styles.form}
            >
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Nombre del Instrumento *</Label>
                <Input
                  {...register("name", {
                    required: "El nombre es obligatorio",
                  })}
                  placeholder="Ej: Telurómetro Digital"
                  className={
                    errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Fila: Marca y Modelo */}
              <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                  <Label className={styles.label}>Marca</Label>
                  <Input {...register("brand")} placeholder="Ej: Fluke" />
                </div>
                <div className={styles.fieldGroup}>
                  <Label className={styles.label}>Modelo</Label>
                  <Input {...register("model")} placeholder="Ej: 1625-2" />
                </div>
              </div>

              {/* Fila: Serie y Código */}
              <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                  <Label className={styles.label}>N° de Serie</Label>
                  <Input {...register("serialNumber")} placeholder="SN-88234" />
                </div>
                <div className={styles.fieldGroup}>
                  <Label className={styles.label}>Cód. Interno (Vitalia)</Label>
                  <Input
                    {...register("internalCode")}
                    placeholder="VIT-INS-01"
                  />
                </div>
              </div>

              {/* Sección: Calibración */}
              <div className={styles.calibrationSection}>
                <h3 className={styles.sectionTitle}>
                  <ShieldCheck size={18} /> Control de Calibración
                </h3>

                <div className={styles.grid}>
                  <div className={styles.fieldGroup}>
                    <Label className={styles.label}>Fecha Calibración *</Label>
                    <Input
                      type="date"
                      {...register("lastCalibrationAt", {
                        required: "Fecha requerida",
                      })}
                      className={
                        errors.lastCalibrationAt ? "border-red-500" : ""
                      }
                    />
                    {errors.lastCalibrationAt && (
                      <p className="text-red-500 text-[10px] mt-1 italic">
                        Requerido
                      </p>
                    )}
                  </div>
                  <div className={styles.fieldGroup}>
                    <Label className={styles.label}>Vencimiento *</Label>
                    <Input
                      type="date"
                      {...register("calibrationDueAt", {
                        required: "Fecha requerida",
                      })}
                      className={
                        errors.calibrationDueAt ? "border-red-500" : ""
                      }
                    />
                    {errors.calibrationDueAt && (
                      <p className="text-red-500 text-[10px] mt-1 italic">
                        Requerido
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload Certificado */}
                <div
                  className={styles.fieldGroup}
                  style={{ marginTop: "0.5rem" }}
                >
                  <Label className={styles.label}>
                    Certificado de Calibración
                  </Label>
                  <div
                    className={`${styles.fileUpload} ${errors.certificateUrl ? "border-red-400 bg-red-50" : ""}`}
                  >
                    <input
                      type="file"
                      id="cert"
                      className="hidden"
                      accept=".pdf,image/*"
                      {...register("certificateUrl")}
                    />
                    <label
                      htmlFor="cert"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload
                        size={20}
                        className={
                          errors.certificateUrl
                            ? "text-red-500"
                            : "text-blue-600"
                        }
                      />
                      <span className="text-sm font-medium">
                        {selectedFile?.[0]
                          ? selectedFile[0].name
                          : "Subir PDF del certificado"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </ScrollArea>
        <div className="p-6 border-t bg-white shrink-0">
          <Button
            type="submit"
            form="equipment-form"
            className="w-full bg-blue-600 h-12 font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform"
            disabled={createEquipment.isPending || updateEquipment.isPending}
          >
            {createEquipment.isPending || updateEquipment.isPending ? (
              <Loader2 className="animate-spin" />
            ) : isEditing ? (
              <span className="flex items-center gap-2">
                <Save size={18} /> Actualizar Equipo
              </span>
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
