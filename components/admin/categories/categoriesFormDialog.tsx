"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Importación del CSS Module
import styles from "./categoriesFormDialog.module.css";

interface CategoryFormValues {
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CategoryFormDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: CategoryFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>Añadir Nueva Categoría Técnica</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>
              Nombre de la Categoría (Ej: TRANSFORMADORES)
            </Label>
            <Input
              {...register("name", { required: "El nombre es obligatorio" })}
              placeholder="NOMBRE EN MAYÚSCULAS"
              className={`${styles.input} ${styles.inputUppercase}`}
            />
            {errors.name && (
              <span className="text-xs text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Descripción</Label>
            <Input
              {...register("description")}
              placeholder="Opcional: Cables, motores, etc..."
              className={styles.input}
            />
          </div>

          <DialogFooter className={styles.footer}>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  CREANDO...
                </>
              ) : (
                "GUARDAR CATEGORÍA"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
