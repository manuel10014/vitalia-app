"use client";

import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
} from "react-hook-form";
import { useProtocols, ProtocolSchema } from "@/hooks/useProtocols";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import styles from "./ProtocolBuilder.module.css";

interface Props {
  versionId: string;
}

interface SectionItemProps {
  sIndex: number;
  control: Control<ProtocolSchema>;
  register: UseFormRegister<ProtocolSchema>;
  onRemove: () => void;
}

export default function ProtocolBuilder({ versionId }: Props) {
  const { useProtocolVersion, updateSchema } = useProtocols();
  const { data: version, isLoading } = useProtocolVersion(versionId);

  const { register, control, handleSubmit } = useForm<ProtocolSchema>({
    values: version?.schemaDefinition || { sections: [] },
  });

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const onSave = (data: ProtocolSchema) => {
    if (!version) return;
    updateSchema.mutate({
      orgProtocolId: version.organizationProtocolId,
      versionId: version.id,
      schema: data,
    });
  };

  if (isLoading) return <p>Cargando editor de ingeniería...</p>;

  return (
    <div className={styles.builderContainer}>
      <header className={styles.builderHeader}>
        <div>
          <h2 className={styles.protocolName}>
            {version?.globalProtocol?.name}
          </h2>
          <p className={styles.versionBadge}>
            Versión {version?.versionNumber}
          </p>
        </div>
        <Button
          onClick={handleSubmit(onSave)}
          disabled={updateSchema.isPending}
          className="gap-2"
        >
          {updateSchema.isPending ? (
            "Guardando..."
          ) : (
            <>
              <Save size={18} /> Guardar Cambios
            </>
          )}
        </Button>
      </header>

      <div className={styles.sectionsList}>
        {sections.map((section, sIndex) => (
          <SectionItem
            key={section.id}
            sIndex={sIndex}
            control={control}
            register={register}
            onRemove={() => removeSection(sIndex)}
          />
        ))}

        <Button
          variant="outline"
          onClick={() =>
            appendSection({ id: crypto.randomUUID(), title: "", fields: [] })
          }
          className="w-full border-dashed py-8"
        >
          <Plus className="mr-2" /> Agregar Nueva Sección
        </Button>
      </div>
    </div>
  );
}

export function SectionItem({
  sIndex,
  control,
  register,
  onRemove,
}: SectionItemProps) {
  const {
    fields: fieldsArray,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `sections.${sIndex}.fields`, // TypeScript validará que esto exista en ProtocolSchema
  });

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1 mr-4">
          <Input
            {...register(`sections.${sIndex}.title`)}
            placeholder="Título de la Sección (ej: Datos de Placa)"
            className="text-lg font-bold border-none focus-visible:ring-0 px-0 h-auto"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:bg-red-50"
          type="button" // Importante para evitar submits accidentales
        >
          <Trash2 size={18} />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {fieldsArray.map((field, fIndex) => (
            <div
              key={field.id}
              className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100"
            >
              <div className="flex-1">
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                  Etiqueta del Campo
                </Label>
                <Input
                  {...register(`sections.${sIndex}.fields.${fIndex}.label`)}
                  placeholder="Ej: Tensión (V)"
                />
              </div>

              <div className="w-40">
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                  Tipo
                </Label>
                <Controller
                  control={control}
                  name={`sections.${sIndex}.fields.${fIndex}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="w-24">
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                  Unidad
                </Label>
                <Input
                  {...register(`sections.${sIndex}.fields.${fIndex}.unit`)}
                  placeholder="V, A, ºC"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(fIndex)}
                type="button"
                className="hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                label: "",
                type: "text",
                required: true,
                options: [], // Añadimos esto para cumplir con la interfaz ProtocolField
              })
            }
            className="mt-2 text-blue-600 hover:bg-blue-50"
          >
            <Plus size={14} className="mr-1" /> Añadir Campo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
