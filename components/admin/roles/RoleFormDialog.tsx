"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { Role } from "@/types";
import { APP_ROLE_OPTIONS, useCreateRole, useUpdateRole } from "@/hooks/useRoles";
import styles from "./RoleFormDialog.module.css";

interface RoleFormValues {
  key: string;
  name: string;
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: Role | null;
  /** Keys ya usados por otros roles de la organización (no se pueden repetir). */
  existingKeys?: string[];
}

export function RoleFormDialog({
  open,
  onOpenChange,
  roleToEdit,
  existingKeys = [],
}: RoleFormDialogProps) {
  const isEditMode = !!roleToEdit;
  // El backend exige key único por organización (una organización solo
  // puede tener un rol por cada permiso base), así que ocultamos los que
  // ya están en uso para no dejar al usuario enviar algo que sabemos que
  // el backend va a rechazar.
  const availableOptions = APP_ROLE_OPTIONS.filter(
    (opt) => !existingKeys.includes(opt.value),
  );
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormValues>({
    defaultValues: { key: "", name: "" },
  });

  const selectedKey = watch("key");

  useEffect(() => {
    if (!open) return;
    if (roleToEdit) {
      reset({ key: roleToEdit.key, name: roleToEdit.name });
    } else {
      reset({ key: "", name: "" });
    }
  }, [open, roleToEdit, reset]);

  const onSubmit = (data: RoleFormValues) => {
    if (isEditMode && roleToEdit) {
      updateMutation.mutate(
        { id: roleToEdit.id, name: data.name },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }
    createMutation.mutate(
      { key: data.key, name: data.name },
      {
        onSuccess: () => {
          reset({ key: "", name: "" });
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Rol" : "Nuevo Rol"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "El permiso base de un rol no se puede cambiar una vez creado; solo su nombre visible."
              : "El permiso (key) determina qué puede hacer este rol en el sistema. El nombre es lo que verán tus usuarios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Permiso base</Label>

            {isEditMode ? (
              <span className={styles.staticKey}>
                <KeyRound size={12} />
                {roleToEdit?.key}
              </span>
            ) : availableOptions.length === 0 ? (
              <p className={styles.helperText}>
                Ya existe un rol para cada permiso disponible en esta
                organización. Edita el nombre de uno existente en vez de
                crear uno nuevo.
              </p>
            ) : (
              <>
                <Select
                  onValueChange={(val) => setValue("key", val)}
                  value={selectedKey}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el permiso base..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("key", {
                    required: "Selecciona el permiso base del rol",
                  })}
                />
                {errors.key && (
                  <span className={styles.errorText}>
                    {errors.key.message}
                  </span>
                )}
                <p className={styles.helperText}>
                  Solo puede existir un rol por cada permiso base en tu
                  organización — el nombre es lo único personalizable.
                </p>
              </>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <Label className={styles.label}>Nombre visible</Label>
            <Input
              placeholder="Ej: Técnico de Campo Senior"
              {...register("name", {
                required: "El nombre es obligatorio",
              })}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name.message}</span>
            )}
          </div>

          <DialogFooter className={styles.footer}>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={
                isPending || (!isEditMode && availableOptions.length === 0)
              }
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                "Guardar Cambios"
              ) : (
                "Crear Rol"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
