"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  QrCode,
  Settings2,
  Plus,
  Trash2,
  Info,
  MapPin,
} from "lucide-react";
import api from "@/lib/api";
import styles from "./AssetsFormSheet.module.css";

import { assetSchema, type AssetFormValues } from "./schema";
import { useProjects } from "@/hooks/useAdmin";
import { Asset } from "@/types";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AxiosError } from "axios";

interface AssetCategory {
  id: string;
  name: string;
}

function useAssetCategories() {
  return useQuery({
    queryKey: ["admin", "asset-categories"],
    queryFn: async () => {
      const res = await api.get<AssetCategory[]>("/asset-categories");
      return Array.isArray(res.data) ? res.data : [];
    },
    initialData: [],
  });
}

interface AssetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
}

export function AssetFormSheet({ open, onOpenChange, asset }: AssetFormProps) {
  const isEditing = !!asset;
  const { data: response } = useProjects();
  const projects = response?.data || [];
  const { data: categories = [] } = useAssetCategories();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      tagId: "",
      name: "",
      categoryId: "",
      locationDescription: "",
      projectId: "",
      specsArray: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "specsArray",
  });

  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  // Autocarga de conductores
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === selectedCategoryId);
    if (
      selectedCat?.name === "CONDUCTORES" &&
      fields.length === 0 &&
      !isEditing
    ) {
      replace([
        { key: "Tipo de conductor(Aislamiento)", value: "EPR" },
        { key: "Tensión nominal [kV]", value: "35" },
        { key: "Calibre [AWG]", value: "750 MCM" },
        { key: "Longitud (M)", value: "" },
        { key: "Inicio", value: "" },
        { key: "Final", value: "" },
      ]);
    }
  }, [selectedCategoryId, categories, replace, fields.length, isEditing]);

  // Reset del form
  useEffect(() => {
    if (open) {
      if (asset) {
        const specsArray = Object.entries(asset.specs || {}).map(
          ([key, value]) => ({
            key,
            value: String(value),
          }),
        );
        form.reset({
          tagId: asset.tagId,
          name: asset.name,
          categoryId: asset.categoryId,
          locationDescription: asset.locationDescription || "",
          projectId: asset.projectId,
          specsArray,
        });
      } else {
        form.reset({
          tagId: "",
          name: "",
          categoryId: "",
          locationDescription: "",
          projectId: "",
          specsArray: [],
        });
      }
    }
  }, [asset, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: AssetFormValues) => {
      const specs = values.specsArray.reduce(
        (acc: Record<string, string>, curr) => {
          if (curr.key) acc[curr.key] = curr.value;
          return acc;
        },
        {},
      );

      const finalPayload = {
        tagId: values.tagId,
        name: values.name,
        categoryId: values.categoryId,
        projectId: values.projectId,
        locationDescription: values.locationDescription,
        specs,
      };

      if (isEditing && asset) {
        return await api.patch(`/assets/${asset.id}`, finalPayload);
      }
      return await api.post("/assets", finalPayload);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error en el servidor");
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles.sheetContent} side="right">
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <QrCode className={styles.titleIcon} size={20} />
            {isEditing ? "Editar Activo" : "Nuevo Activo Técnico"}
          </SheetTitle>
          <SheetDescription>
            Configura los datos del equipo y sus especificaciones.
          </SheetDescription>
        </SheetHeader>

        {/* ScrollArea envuelve todo el formulario */}
        <ScrollArea className={styles.scrollArea}>
          <form
            id="asset-form"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className={styles.form}
          >
            {/* Datos Básicos */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <Info size={18} /> <span>Datos Básicos</span>
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                  <Label>Tag ID *</Label>
                  <Input
                    {...form.register("tagId")}
                    placeholder="MOT-001"
                    className={styles.monospaceInput}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Categoría *</Label>
                  <Controller
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <Label>Nombre / Modelo *</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Ej: Compresor 50HP"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <MapPin size={18} /> <span>Ubicación</span>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <Label>Proyecto *</Label>
                <Controller
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Proyecto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Descripción Ubicación</Label>
                <Input
                  {...form.register("locationDescription")}
                  placeholder="Ej: Planta 2, Sector A"
                />
              </div>
            </div>

            {/* Especificaciones */}
            {/* Sección de Especificaciones con altura fija y scroll propio */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <Settings2 size={18} />
                  <span>Especificaciones Técnicas</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                >
                  <Plus size={14} />
                </Button>
              </div>

              <div className={styles.specsContainer}>
                {fields.length === 0 && (
                  <p className={styles.emptySpecs}>
                    Sin parámetros registrados.
                  </p>
                )}
                {fields.map((field, index) => (
                  <div key={field.id} className={styles.specRow}>
                    <Input
                      {...form.register(`specsArray.${index}.key`)}
                      placeholder="Propiedad"
                      className={styles.specInput}
                    />
                    <Input
                      {...form.register(`specsArray.${index}.value`)}
                      placeholder="Valor"
                      className={styles.specInput}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <SheetFooter className={styles.footer}>
          <Button
            type="submit"
            form="asset-form"
            className={styles.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "REGISTRAR ACTIVO"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
