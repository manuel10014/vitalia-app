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
import { ScrollArea } from "@/components/ui/scroll-area"; // Importado
import { BookPlus, ShieldCheck, Loader2 } from "lucide-react";
import styles from "./createGlobalProtocols.module.css";

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
        <Button className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
          <BookPlus size={18} /> Nueva Norma Técnica
        </Button>
      </DialogTrigger>

      {/* Ajustamos el contenido para que sea flexible */}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className={styles.title}>
            <ShieldCheck className={styles.icon} size={24} />
            Registro de Estándar Global
          </DialogTitle>
        </DialogHeader>

        {/* Envolvemos los campos en un ScrollArea */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <form
            id="global-protocol-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Nombre del Protocolo</Label>
              <Input
                {...register("name", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Transformadores de Potencia"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Código / Norma</Label>
                <Input
                  {...register("code", {
                    required: "El código es obligatorio",
                  })}
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
              <Label className={styles.label}>
                Descripción e Instrucciones
              </Label>
              <Textarea
                {...register("description")}
                className="min-h-[120px] resize-none"
                placeholder="Defina el alcance técnico de esta normativa..."
              />
            </div>
          </form>
        </ScrollArea>

        {/* El footer queda fijo abajo para que el botón siempre sea visible */}
        <div className="p-6 border-t bg-gray-50">
          <Button
            type="submit"
            form="global-protocol-form" // Conectamos el botón con el ID del form
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
