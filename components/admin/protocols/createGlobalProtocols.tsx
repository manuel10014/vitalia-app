"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useProtocols, GlobalProtocol } from "@/hooks/useProtocols";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookPlus, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./createGlobalProtocols.module.css";

type GlobalServiceForm = Pick<
  GlobalProtocol,
  "name" | "code" | "category" | "description"
>;

export function CreateGlobalProtocolModal() {
  const [open, setOpen] = useState(false);
  const { createGlobalProtocol } = useProtocols();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GlobalServiceForm>({
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = (data: GlobalServiceForm) => {
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
        <Button className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 font-bold">
          <BookPlus size={18} /> Nuevo Servicio Global
        </Button>
      </DialogTrigger>

      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.titleContainer}>
            <div className={styles.iconWrapper}>
              <Zap className={styles.icon} size={20} />
            </div>
            Registro de Servicio Técnico
          </DialogTitle>
          <p className={styles.subtitle}>
            Defina un nuevo estándar de ingeniería para la biblioteca global.
          </p>
        </DialogHeader>

        <ScrollArea className={styles.formContainer}>
          <form
            id="global-protocol-form"
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
          >
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>
                Nombre del Servicio / Prueba
              </Label>
              <Input
                {...register("name", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Análisis de Aceites DGA"
                className={cn(errors.name && styles.inputError)}
              />
              {errors.name && (
                <span className={styles.errorMessage}>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Código / Referencia</Label>
                <Input
                  {...register("code", {
                    required: "El código es obligatorio",
                  })}
                  placeholder="Ej: ASTM D3612"
                  className={cn(errors.code && styles.inputError)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Categoría Técnica</Label>
                <Input
                  {...register("category", {
                    required: "La categoría es obligatoria",
                  })}
                  placeholder="Ej: QUÍMICA"
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Alcance Técnico</Label>
              <Textarea
                {...register("description")}
                className={styles.textarea}
                placeholder="Especifique el objetivo del servicio..."
              />
            </div>
          </form>
        </ScrollArea>

        <div className={styles.footer}>
          <Button
            type="submit"
            form="global-protocol-form"
            className={cn("bg-blue-600 hover:bg-blue-700", styles.submitButton)}
            disabled={createGlobalProtocol.isPending}
          >
            {createGlobalProtocol.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                REGISTRANDO...
              </>
            ) : (
              "DAR DE ALTA SERVICIO"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
