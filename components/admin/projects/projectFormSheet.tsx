"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LayoutGrid, Building, Hash, Activity } from "lucide-react";
import api from "@/lib/api";
import styles from "./projects.module.css";

import { projectSchema, type ProjectFormValues } from "./schema";
import { useClients } from "@/hooks/useAdmin";
import { Project } from "@/types";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AxiosError } from "axios";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectFormSheet({
  open,
  onOpenChange,
  project,
}: ProjectFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const { data: clientsRes } = useClients(1);
  const clients = clientsRes?.data || [];

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      code: "",
      clientId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (project) {
        form.reset({
          name: project.name,
          code: project.code || "",
          clientId: project.clientId,
          isActive: project.isActive,
        });
      } else {
        form.reset({ name: "", code: "", clientId: "", isActive: true });
      }
    }
  }, [project, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      if (isEditing && project) {
        return await api.patch(`/projects/${project.id}`, values);
      }
      return await api.post("/projects", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success(isEditing ? "Proyecto actualizado" : "Proyecto creado");
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error en el servidor");
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles.sheetContent}>
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <LayoutGrid className={styles.titleIcon} size={20} />
            {isEditing ? "Editar Proyecto" : "Nuevo Proyecto Técnico"}
          </SheetTitle>
          <SheetDescription className={styles.description}>
            {isEditing
              ? `Actualizando datos para: ${project?.name}`
              : "Asigna un nombre y un cliente para iniciar el proyecto."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="project-form"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className={styles.form}
        >
          {/* Selector de Cliente */}
          <div className={styles.fieldGroup}>
            <Label className={styles.label}>
              <Building className={styles.labelIcon} /> Cliente Responsable *
            </Label>
            <Controller
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isEditing}
                >
                  <SelectTrigger
                    className={
                      form.formState.errors.clientId ? styles.errorInput : ""
                    }
                  >
                    <SelectValue placeholder="Seleccione una empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.clientId && (
              <p className={styles.errorMessage}>
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          {/* Nombre del Proyecto */}
          <div className={styles.fieldGroup}>
            <Label htmlFor="name" className={styles.label}>
              Nombre del Proyecto *
            </Label>
            <Input
              {...form.register("name")}
              id="name"
              placeholder="Ej: Planta Fotovoltaica Sector A"
              className={form.formState.errors.name ? styles.errorInput : ""}
            />
            {form.formState.errors.name && (
              <p className={styles.errorMessage}>
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Código Interno */}
          <div className={styles.fieldGroup}>
            <Label htmlFor="code" className={styles.label}>
              <Hash className={styles.labelIcon} /> Código Interno
            </Label>
            <Input
              {...form.register("code")}
              id="code"
              placeholder="PRJ-2024-001"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* Estado del Proyecto */}
          <div className={styles.statusCard}>
            <div className={styles.statusInfo}>
              <Label className={styles.statusLabel}>
                <Activity className={styles.activeIcon} size={16} />
                Proyecto Activo
              </Label>
              <p className={styles.statusHelper}>
                Los proyectos inactivos no pueden recibir nuevos activos.
              </p>
            </div>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </form>

        <SheetFooter className={styles.footer}>
          <Button
            type="submit"
            form="project-form"
            className={styles.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />{" "}
                Procesando...
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Proyecto"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
