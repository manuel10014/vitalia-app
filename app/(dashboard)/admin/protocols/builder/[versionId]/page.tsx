"use client";

import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
} from "react-hook-form";
import { useProtocols } from "@/hooks/useProtocols";
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
import {
  Plus,
  Trash2,
  Save,
  Zap,
  Image as ImageIcon,
  Loader2,
  Layers,
} from "lucide-react";
import styles from "./ProtocolBuilder.module.css";
import { toast } from "sonner";
import { ProtocolSchema } from "@/types";

interface Props {
  versionId: string;
}

// Objeto base para evitar errores de tipado (TS2322)
const DEFAULT_SCHEMA: ProtocolSchema = {
  protocol_name: "",
  version: "1.0.0",
  sections: [],
};

export default function ProtocolBuilder({ versionId }: Props) {
  const { useProtocolVersion, updateSchema } = useProtocols();
  const { data: version, isLoading } = useProtocolVersion(versionId);

  // Inicialización del formulario con validación de esquema
  const { register, control, handleSubmit, reset } = useForm<ProtocolSchema>({
    values: (version?.schemaDefinition as ProtocolSchema) || DEFAULT_SCHEMA,
  });

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  // FUNCIÓN PARA CARGAR VLF (Corregida para TS2352)
  const loadVLFTemplate = () => {
    const vlfTemplate: ProtocolSchema = {
      protocol_name: version?.globalProtocol?.name || "Ensayo VLF",
      version: String(version?.versionNumber || "1"),
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
    reset(vlfTemplate);
    toast.success("Plantilla VLF cargada en el editor local");
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
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">
        Sincronizando con el servidor de ingeniería...
      </div>
    );

  return (
    <div className={styles.builderContainer}>
      <header className={styles.builderHeader}>
        <div className="text-left">
          <h2 className={styles.protocolName}>
            {version?.globalProtocol?.name}
          </h2>
          <p className={styles.versionBadge}>
            Versión {version?.versionNumber} — Estructura de Captura
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={loadVLFTemplate}
            className="border-amber-500 text-amber-600 hover:bg-amber-50 gap-2 font-black rounded-xl"
          >
            <Zap size={18} /> USAR PLANTILLA VLF
          </Button>

          <Button
            onClick={handleSubmit(onSave)}
            disabled={updateSchema.isPending}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl px-6"
          >
            {updateSchema.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {updateSchema.isPending ? "GUARDANDO..." : "PUBLICAR PROTOCOLO"}
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
          type="button"
          onClick={() =>
            appendSection({
              id: crypto.randomUUID(),
              title: "Nueva Sección de Datos",
              fields: [],
            })
          }
          className="w-full border-dashed border-2 py-10 rounded-[2rem] hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all font-black uppercase text-xs tracking-widest"
        >
          <Plus className="mr-2" size={20} /> Crear Nueva Sección
        </Button>
      </div>
    </div>
  );
}

// COMPONENTE DE SECCIÓN
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
    <Card className="mb-10 border-slate-200 shadow-lg rounded-[2.5rem] overflow-hidden border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-slate-900 p-6 text-white">
        <div className="flex-1 flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Layers size={20} />
          </div>
          <Input
            {...register(`sections.${sIndex}.title`)}
            placeholder="Nombre de la sección (ej: Mediciones)"
            className="text-lg font-black border-none focus-visible:ring-0 bg-transparent px-0 h-auto placeholder:text-slate-500 uppercase"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-slate-400 hover:text-white hover:bg-red-500/20 rounded-full"
          type="button"
        >
          <Trash2 size={20} />
        </Button>
      </CardHeader>

      <CardContent className="p-8">
        <div className="space-y-4">
          {fieldsArray.map((field, fIndex) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 group transition-all hover:border-blue-200"
            >
              <div className="flex-1 w-full">
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  Etiqueta del Campo
                </Label>
                <Input
                  {...register(`sections.${sIndex}.fields.${fIndex}.label`)}
                  placeholder="Ej: Corriente de Fuga"
                  className="h-12 rounded-xl font-bold border-slate-200"
                />
              </div>

              <div className="w-full md:w-48">
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  Tipo
                </Label>
                <Controller
                  control={control}
                  name={`sections.${sIndex}.fields.${fIndex}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Abierto (Texto)</SelectItem>
                        <SelectItem value="number">Numérico</SelectItem>
                        <SelectItem value="image">Cámara / Foto</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="w-full md:w-28">
                <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                  Unidad
                </Label>
                <Input
                  {...register(`sections.${sIndex}.fields.${fIndex}.unit`)}
                  placeholder="kV, mA..."
                  className="h-12 rounded-xl bg-white border-slate-200 font-bold"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(fIndex)}
                type="button"
                className="h-12 w-12 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
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
              className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest h-10 px-4"
            >
              <Plus size={14} className="mr-2" /> Añadir Parámetro
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  label: "Evidencia",
                  type: "image",
                  required: true,
                  options: [],
                })
              }
              className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest h-10 px-4"
            >
              <ImageIcon size={14} className="mr-2" /> Añadir Foto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
