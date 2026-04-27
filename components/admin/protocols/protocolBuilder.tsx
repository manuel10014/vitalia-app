"use client";

import { useState, useEffect } from "react";
import { useProtocols } from "@/hooks/useProtocols";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Zap,
  Loader2,
} from "lucide-react";
import styles from "./protocolBuilder.module.css";
import { toast } from "sonner";
import { ProtocolSchema } from "@/types";

type FieldType =
  | "number"
  | "select"
  | "textarea"
  | "image"
  | "text"
  | "date"
  | "file"
  | "signature"
  | "check"
  | "camera";

interface Field {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  required: boolean;
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

export default function ProtocolBuilder({ versionId }: { versionId: string }) {
  const { useProtocolVersion, updateSchema } = useProtocols();
  const { data: version, isLoading } = useProtocolVersion(versionId);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (version?.schemaDefinition?.sections) {
      setSections(version.schemaDefinition.sections as Section[]);
    }
  }, [version]);

  const loadVLFTemplate = () => {
    const vlfTemplate: Section[] = [
      {
        id: crypto.randomUUID(),
        title: "Ubicación y Datos del Conductor",
        fields: [
          {
            id: crypto.randomUUID(),
            label: "Ubicación del Conductor",
            type: "text",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Inicio del Conductor",
            type: "text",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Final del Conductor",
            type: "text",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Número de Fase",
            type: "text",
            required: true,
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
          },
          {
            id: crypto.randomUUID(),
            label: "Tensión de Ensayo",
            type: "number",
            unit: "kV",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Duración",
            type: "number",
            unit: "min",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Capacitancia",
            type: "number",
            unit: "nF",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Corriente de Fuga Final",
            type: "number",
            unit: "mA",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Resultado",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: "Evidencia Fotográfica",
        fields: [
          {
            id: crypto.randomUUID(),
            label: "Evidencia 1",
            type: "image",
            required: true,
          },
          {
            id: crypto.randomUUID(),
            label: "Evidencia 2",
            type: "image",
            required: true,
          },
        ],
      },
    ];
    setSections(vlfTemplate);
    toast.success("Plantilla VLF cargada");
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: "Nueva Sección",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const addField = (sectionId: string, type: FieldType = "number") => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            fields: [
              ...s.fields,
              {
                id: crypto.randomUUID(),
                label: "Nuevo Parámetro",
                type,
                required: true,
              },
            ],
          };
        }
        return s;
      }),
    );
  };

  // 🟢 SOLUCIÓN TS: Empaquetado de datos para el Back-end
  const handleSave = () => {
    if (!version?.organizationProtocolId) {
      toast.error("Error: No se pudo identificar el protocolo");
      return;
    }

    const fullSchema: ProtocolSchema = {
      protocol_name: version.globalProtocol?.name || "Protocolo de Ingeniería",
      version: version.versionNumber.toString(),
      sections: sections,
    };

    updateSchema.mutate({
      versionId,
      orgProtocolId: version.organizationProtocolId,
      schema: fullSchema,
    });
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase text-xs tracking-widest">
        Sincronizando con Servidor Vitalia...
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className="text-xl font-black text-slate-800">
            Diseñador de Servicio Técnico
          </h2>
          <p className={styles.versionText}>
            Configurando: {version?.globalProtocol?.name} (v
            {version?.versionNumber})
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            variant="outline"
            onClick={loadVLFTemplate}
            className="border-amber-500 text-amber-600 hover:bg-amber-50 font-bold"
          >
            <Zap size={16} className="mr-2" /> Cargar Plantilla VLF
          </Button>

          <Button
            onClick={handleSave}
            disabled={updateSchema.isPending}
            className="bg-slate-900 text-white font-black hover:bg-slate-800"
          >
            {updateSchema.isPending ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {updateSchema.isPending ? "Publicando..." : "Publicar Cambios"}
          </Button>
        </div>
      </header>

      <div className={styles.editorOnlyArea}>
        <div className={styles.contentWrapper}>
          {sections.map((section, sIdx) => (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <input
                  className={styles.sectionTitleInput}
                  value={section.title}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[sIdx].title = e.target.value;
                    setSections(newSections);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSections(sections.filter((s) => s.id !== section.id))
                  }
                >
                  <Trash2 size={16} className="text-red-400" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {section.fields.map((field, fIdx) => (
                  <div key={field.id} className={styles.fieldRow}>
                    <div className="flex-[2] text-left">
                      <span className={styles.fieldMeta}>Etiqueta</span>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].label = e.target.value;
                          setSections(newSections);
                        }}
                        className="font-bold border-slate-200"
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <span className={styles.fieldMeta}>Tipo</span>
                      <select
                        className="w-full h-10 text-sm border border-slate-200 rounded-md px-2 bg-white font-medium"
                        value={field.type}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].type = e.target
                            .value as FieldType;
                          setSections(newSections);
                        }}
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="image">📸 Imagen / Cámara</option>
                        <option value="date">Fecha</option>
                        <option value="signature">Firma</option>
                      </select>
                    </div>

                    <div className="w-24 text-left">
                      <span className={styles.fieldMeta}>Unidad</span>
                      <Input
                        value={field.unit || ""}
                        placeholder="kV"
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].unit = e.target.value;
                          setSections(newSections);
                        }}
                        className="text-center font-black text-blue-600 border-slate-200"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6 hover:bg-red-50 hover:text-red-500"
                      onClick={() => {
                        const newSections = [...sections];
                        newSections[sIdx].fields = newSections[
                          sIdx
                        ].fields.filter((f) => f.id !== field.id);
                        setSections(newSections);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50 font-black uppercase text-[10px] tracking-widest"
                    onClick={() => addField(section.id, "number")}
                  >
                    <Plus size={14} className="mr-2" /> Añadir Dato
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest"
                    onClick={() => addField(section.id, "image")}
                  >
                    <ImageIcon size={14} className="mr-2" /> Añadir Foto
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={addSection}
            className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all font-black uppercase tracking-widest text-xs"
            variant="outline"
          >
            <Plus size={20} className="mr-3" /> Crear Nueva Sección de
            Ingeniería
          </Button>
        </div>
      </div>
    </div>
  );
}
