"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useProtocols, GlobalProtocol } from "@/hooks/useProtocols"; // Importamos el tipo
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookPlus, ShieldCheck, Loader2 } from "lucide-react";
import styles from "./createGlobalProtocols.module.css";

// Definimos la forma del formulario basada en el modelo
type GlobalProtocolForm = Pick<
  GlobalProtocol,
  "name" | "code" | "category" | "description"
>;

export function CreateGlobalProtocolModal() {
  const [open, setOpen] = useState(false);
  const { createGlobalProtocol } = useProtocols();

  const { register, handleSubmit, reset } = useForm<GlobalProtocolForm>({
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = (data: GlobalProtocolForm) => {
    createGlobalProtocol.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <BookPlus size={18} /> Nueva Norma Técnica
        </Button>
      </DialogTrigger>

      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.title}>
            <ShieldCheck className={styles.icon} size={24} />
            Registro de Estándar Global
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Nombre del Protocolo</Label>
            <Input
              {...register("name", { required: "El nombre es obligatorio" })}
              placeholder="Ej: Transformadores de Potencia"
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Código / Norma</Label>
              <Input
                {...register("code", { required: "El código es obligatorio" })}
                placeholder="Ej: IEEE C57.12"
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Categoría</Label>
              <Input
                {...register("category", {
                  required: "La categoría es obligatoria",
                })}
                placeholder="Ej: SUBESTACIONES"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Descripción e Instrucciones</Label>
            <Textarea
              {...register("description")}
              className={styles.textarea}
              placeholder="Defina el alcance técnico de esta normativa..."
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={createGlobalProtocol.isPending}
            >
              {createGlobalProtocol.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Publicando...
                </>
              ) : (
                "Publicar en Biblioteca"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
