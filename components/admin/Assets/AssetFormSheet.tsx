"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Settings2, Plus, Trash2, Info, Factory } from "lucide-react";
import api from "@/lib/api";
import styles from "./AssetsFormSheet.module.css";

import { assetSchema, type AssetFormValues } from "./schema";
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
  const { data: categories = [] } = useAssetCategories();
  const queryClient = useQueryClient();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      categoryId: "",
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

  // Autocarga de especificaciones técnicas fijas (CONDUCTORES)
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === selectedCategoryId);
    if (
      selectedCat?.name === "CONDUCTORES" &&
      fields.length === 0 &&
      !isEditing
    ) {
      replace([
        { key: "Tipo de aislamiento", value: "EPR" },
        { key: "Tensión nominal [kV]", value: "35" },
        { key: "Calibre [AWG/MCM]", value: "750" },
        { key: "Material", value: "Aluminio" },
      ]);
    }
  }, [selectedCategoryId, categories, replace, fields.length, isEditing]);

  // Reset del form al abrir/cambiar activo
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
          name: asset.name,
          categoryId: asset.categoryId,
          specsArray,
        });
      } else {
        form.reset({
          name: "",
          categoryId: "",
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
        name: values.name,
        categoryId: values.categoryId,
        specs,
      };

      if (isEditing && asset) {
        return await api.patch(`/assets/${asset.id}`, finalPayload);
      }
      return await api.post("/assets", finalPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success(isEditing ? "Activo actualizado" : "Activo registrado");
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error en el servidor");
    },
  });

  const onSubmit = (data: AssetFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles.sheetContent} side="right">
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <Factory className={styles.titleIcon} size={20} />
            {isEditing ? "Editar Ficha Técnica" : "Nueva Ficha de Fabricación"}
          </SheetTitle>
          <SheetDescription>
            Registre únicamente los datos técnicos permanentes del activo.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={styles.scrollArea}>
          <form
            id="asset-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className={styles.form}
          >
            {/* Datos de Fabricación */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <Info size={18} /> <span>Identificación de Fábrica</span>
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                  <Label>Nombre / Modelo del Equipo *</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="Ej: Transformador Seco 2500kVA"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Categoría de Activo *</Label>
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
            </div>

            {/* Especificaciones Técnicas */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <Settings2 size={18} />
                  <span>Especificaciones Técnicas (Fijas)</span>
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
                {fields.map((field, index) => (
                  <div key={field.id} className={styles.specRow}>
                    <Input
                      {...form.register(`specsArray.${index}.key`)}
                      placeholder="Ej: Marca"
                      className={styles.specInput}
                    />
                    <Input
                      {...form.register(`specsArray.${index}.value`)}
                      placeholder="Ej: ABB"
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
              "GUARDAR FICHA TÉCNICA"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
