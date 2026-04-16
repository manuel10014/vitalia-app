"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormData } from "./schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldCheck, User as UserIcon, Award } from "lucide-react";
import styles from "./usersFormSheet.module.css";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types";

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
}

export interface UserPayload {
  fullName: string;
  email: string;
  password?: string;
  roleId: string;
  isActive: boolean;
  professionalLicense?: string | null;
}

export function UserFormSheet({
  open,
  onOpenChange,
  userToEdit,
}: UserFormSheetProps) {
  const { useCreateUser, useUpdateUser, useGetRoles } = useUsers();
  const { data: roles, isLoading: isLoadingRoles } = useGetRoles();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleId: "", // Cambia 'roles: []' por 'roleId: ""'
      isActive: true,
      professionalLicense: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = form;

  // Mutaciones
  const { mutate: createMutate, isPending: isCreating } = useCreateUser(() => {
    onOpenChange(false);
  });

  const { mutate: updateMutate, isPending: isUpdating } = useUpdateUser(() => {
    onOpenChange(false);
  });

  const isPending = isCreating || isUpdating;

  const selectedRoleId = watch("roleId");
  const selectedRoleData = roles?.find((r) => r.id === selectedRoleId);

  const isTechnicalRole =
    selectedRoleData?.name.toLowerCase().includes("técnico") ||
    selectedRoleData?.name.toLowerCase().includes("tech");

  // Tipado explícito de data para evitar errores de inferencia
  const onSubmit = (data: UserFormData) => {
    const payload: UserPayload = {
      fullName: data.fullName,
      email: data.email,
      roleId: data.roleId,
      isActive: data.isActive,
      professionalLicense: isTechnicalRole ? data.professionalLicense : null,
    };

    // Password solo en creación o si se desea cambiar en edición
    if (data.password && data.password.trim().length >= 6) {
      payload.password = data.password;
    }

    if (userToEdit) {
      updateMutate({ id: userToEdit.id, data: payload });
    } else {
      createMutate(payload);
    }
  };

  const handleRoleChange = async (val: string) => {
    setValue("roleId", val);
    await trigger("roleId");
  };
  useEffect(() => {
    if (open) {
      if (userToEdit) {
        reset({
          fullName: userToEdit.fullName,
          email: userToEdit.email,
          password: "",
          roleId: userToEdit.roles?.[0] || "",
          isActive: userToEdit.isActive,
          professionalLicense: userToEdit.professionalLicense || "",
        });
      } else {
        reset({
          fullName: "",
          email: "",
          password: "",
          roleId: "",
          isActive: true,
          professionalLicense: "",
        });
      }
    }
  }, [userToEdit, open, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6">
          <SheetTitle className="flex items-center gap-2">
            <UserIcon className="text-blue-600" size={20} />
            {userToEdit ? "Editar Colaborador" : "Nuevo Colaborador"}
          </SheetTitle>
          <SheetDescription>
            {userToEdit
              ? `Actualizando datos de ${userToEdit.fullName}`
              : "Crea una cuenta para técnicos o personal administrativo."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Nombre Completo */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre Completo</label>
              <Input
                placeholder="Ej: Carlos Rodriguez"
                {...register("fullName")}
                className={errors.fullName ? styles.inputError : ""}
              />
              {errors.fullName && (
                <span className={styles.errorMessage}>
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Corporativo</label>
              <Input
                type="email"
                placeholder="carlos@vitalia.com"
                {...register("email")}
                className={errors.email ? styles.inputError : ""}
              />
              {errors.email && (
                <span className={styles.errorMessage}>
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Contraseña</label>
              <Input
                type="password"
                placeholder={
                  userToEdit
                    ? "Dejar vacío para no cambiar"
                    : "Mínimo 6 caracteres"
                }
                {...register("password")}
                className={errors.password ? styles.inputError : ""}
              />
              {errors.password && (
                <span className={styles.errorMessage}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Roles */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Rol en la Organización</label>
              <Select
                onValueChange={handleRoleChange}
                value={selectedRoleId || ""}
              >
                <SelectTrigger
                  className={errors.roleId ? styles.inputError : ""}
                >
                  <SelectValue
                    placeholder={
                      isLoadingRoles ? "Cargando..." : "Asignar rol..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <span className={styles.errorMessage}>
                  {errors.roleId.message}
                </span>
              )}
            </div>

            {/* Campo Dinámico: Matrícula Profesional */}
            {isTechnicalRole && (
              <div
                className={`${styles.fieldGroup} animate-in fade-in slide-in-from-top-2`}
              >
                <label className={`${styles.label} flex items-center gap-2`}>
                  <Award size={14} className="text-amber-600" />
                  Matrícula Profesional (M.P.)
                </label>
                <Input
                  placeholder="Ej: MP123456"
                  {...register("professionalLicense")}
                  className={
                    errors.professionalLicense ? styles.inputError : ""
                  }
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Necesario para la firma de reportes técnicos oficiales.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t mt-auto">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {isPending
                ? "Procesando..."
                : userToEdit
                  ? "Guardar Cambios"
                  : "Registrar en Vitalia"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
