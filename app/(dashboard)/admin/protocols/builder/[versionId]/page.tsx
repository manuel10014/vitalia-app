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
import { Plus, Trash2, Save, Zap, Image as ImageIcon } from "lucide-react";
import styles from "./ProtocolBuilder.module.css";
import { toast } from "sonner";

interface Props {
  versionId: string;
}

export default function ProtocolBuilder({ versionId }: Props) {
  const { useProtocolVersion, updateSchema } = useProtocols();
  const { data: version, isLoading } = useProtocolVersion(versionId);

  const { register, control, handleSubmit, reset } = useForm<ProtocolSchema>({
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

  //  FUNCIÓN PARA CARGAR VLF RÁPIDAMENTE
  const loadVLFTemplate = () => {
    const vlfTemplate = {
      sections: [
        {
          id: crypto.randomUUID(),
          title: "Ubicación y Datos del Conductor",
          fields: [
            {
              id: crypto.randomUUID(),
              label: "Ubicación del Conductor",
              type: "text",
              required: true,
              options: [],
            },
            {
              id: crypto.randomUUID(),
              label: "Inicio del Conductor",
              type: "text",
              required: true,
              options: [],
            },
            {
              id: crypto.randomUUID(),
              label: "Final del Conductor",
              type: "text",
              required: true,
              options: [],
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          title: "Parámetros de Ensayo VLF",
          fields: [
            {
              id: crypto.randomUUID(),
              label: "Longitud",
              type: "number",
              unit: "m",
              required: true,
              options: [],
            },
            {
              id: crypto.randomUUID(),
              label: "Tensión Ensayo",
              type: "number",
              unit: "kV",
              required: true,
              options: [],
            },
            {
              id: crypto.randomUUID(),
              label: "Corriente Fuga",
              type: "number",
              unit: "mA",
              required: true,
              options: [],
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          title: "Evidencia Fotográfica",
          fields: [
            {
              id: crypto.randomUUID(),
              label: "Foto Conexiones",
              type: "image",
              required: true,
              options: [],
            },
            {
              id: crypto.randomUUID(),
              label: "Foto Resultado Pantalla",
              type: "image",
              required: true,
              options: [],
            },
          ],
        },
      ],
    };
    reset(vlfTemplate as ProtocolSchema);
    toast.success("Plantilla VLF cargada correctamente");
  };

  const onSave = (data: ProtocolSchema) => {
    if (!version) return;
    updateSchema.mutate({
      orgProtocolId: version.organizationProtocolId,
      versionId: version.id,
      schema: data,
    });
  };

  if (isLoading)
    return <p className="p-10 text-center">Cargando editor de ingeniería...</p>;

  return (
    <div className={styles.builderContainer}>
      <header className={styles.builderHeader}>
        <div>
          <h2 className={styles.protocolName}>
            {version?.globalProtocol?.name}
          </h2>
          <p className={styles.versionBadge}>
            Versión {version?.versionNumber} - Configuración Técnica
          </p>
        </div>

        <div className="flex gap-3">
          {/*  BOTÓN DE CARGA RÁPIDA VLF */}
          <Button
            variant="outline"
            onClick={loadVLFTemplate}
            className="border-amber-500 text-amber-600 hover:bg-amber-50 gap-2"
          >
            <Zap size={18} /> Cargar Plantilla VLF
          </Button>

          <Button
            onClick={handleSubmit(onSave)}
            disabled={updateSchema.isPending}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Save size={18} />
            {updateSchema.isPending
              ? "Guardando en EC2..."
              : "Publicar Cambios"}
          </Button>
        </div>
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
            appendSection({
              id: crypto.randomUUID(),
              title: "Nueva Sección",
              fields: [],
            })
          }
          className="w-full border-dashed py-8 hover:bg-slate-50"
        >
          <Plus className="mr-2" /> Agregar Nueva Sección de Ingeniería
        </Button>
      </div>
    </div>
  );
}

interface SectionItemProps {
  sIndex: number;
  control: Control<ProtocolSchema>;
  register: UseFormRegister<ProtocolSchema>;
  onRemove: () => void;
}

function SectionItem({
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
    name: `sections.${sIndex}.fields`,
  });

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-slate-50/50 pb-3">
        <div className="flex-1 mr-4">
          <Input
            {...register(`sections.${sIndex}.title`)}
            placeholder="Título de la Sección"
            className="text-lg font-bold border-none focus-visible:ring-0 bg-transparent px-0 h-auto"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:bg-red-50"
          type="button"
        >
          <Trash2 size={18} />
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3">
          {fieldsArray.map((field, fIndex) => (
            <div
              key={field.id}
              className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100"
            >
              <div className="flex-1">
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                  Etiqueta
                </Label>
                <Input
                  {...register(`sections.${sIndex}.fields.${fIndex}.label`)}
                  placeholder="Ej: Tensión de Ensayo"
                />
              </div>

              <div className="w-44">
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                  Tipo de Entrada
                </Label>
                <Controller
                  control={control}
                  name={`sections.${sIndex}.fields.${fIndex}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Libre</SelectItem>
                        <SelectItem value="number">Valor Numérico</SelectItem>
                        <SelectItem value="image">
                          📸 Captura de Foto
                        </SelectItem>
                        <SelectItem value="select">
                          Lista de Selección
                        </SelectItem>
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
                  placeholder="kV, mA..."
                  className="bg-white"
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

          <div className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  label: "",
                  type: "number",
                  required: true,
                  options: [],
                })
              }
              className="text-blue-600 hover:bg-blue-50"
            >
              <Plus size={14} className="mr-1" /> Añadir Parámetro
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  label: "Registro Fotográfico",
                  type: "image",
                  required: true,
                  options: [],
                })
              }
              className="text-emerald-600 hover:bg-emerald-50"
            >
              <ImageIcon size={14} className="mr-1" /> Añadir Foto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
