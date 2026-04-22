"use client";

import { useState, useEffect } from "react";
import { useProtocols } from "@/hooks/useProtocols";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Image as ImageIcon, Zap } from "lucide-react";
import styles from "./protocolBuilder.module.css";
import { toast } from "sonner";

interface Field {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "check" | "image";
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
      setSections(version.schemaDefinition.sections);
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
        title: "Evidencia Fotográfica (2 por medición)",
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
    toast.success("Plantilla VLF cargada: 12 parámetros definidos");
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: "Nueva Sección",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const addField = (sectionId: string, type: Field["type"] = "number") => {
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

  const saveChanges = () => {
    if (!version?.organizationProtocolId) {
      toast.error("No se pudo identificar el protocolo");
      return;
    }

    updateSchema.mutate({
      versionId,
      orgProtocolId: version.organizationProtocolId,
      schema: { sections },
    });
  };

  if (isLoading)
    return <div className={styles.loading}>Cargando Ingeniería...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* FILA 1: Título y versión */}
        <div className={styles.titleGroup}>
          <h2>Diseñador de Servicio Técnico</h2>
          <p className={styles.versionText}>
            Configurando: {version?.globalProtocol?.name} (v
            {version?.versionNumber})
          </p>
        </div>

        {/* FILA 2: Botones */}
        <div className={styles.buttonGroup}>
          <Button
            variant="outline"
            onClick={loadVLFTemplate}
            className="border-amber-500 text-amber-600 hover:bg-amber-50"
          >
            <Zap size={16} className="mr-2" /> Cargar Plantilla
          </Button>

          <Button
            onClick={saveChanges}
            disabled={updateSchema.isPending}
            className={styles.saveBtn}
          >
            <Save size={16} className="mr-2" />
            {updateSchema.isPending ? "Guardando..." : "Guardar Configuración"}
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
                  <Trash2 size={16} color="#f87171" />
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {section.fields.map((field, fIdx) => (
                  <div key={field.id} className={styles.fieldRow}>
                    <div className="flex-[2]">
                      <span className={styles.fieldMeta}>Nombre del Campo</span>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].label = e.target.value;
                          setSections(newSections);
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <span className={styles.fieldMeta}>Tipo</span>
                      <select
                        className="w-full h-10 text-sm border rounded-md px-2 bg-white"
                        value={field.type}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].type = e.target
                            .value as Field["type"];
                          setSections(newSections);
                        }}
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="image">Imagen/Foto</option>
                      </select>
                    </div>

                    <div className="w-24">
                      <span className={styles.fieldMeta}>Unidad</span>
                      <Input
                        value={field.unit || ""}
                        placeholder="Ej: kV"
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].unit = e.target.value;
                          setSections(newSections);
                        }}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mb-0.5"
                      onClick={() => {
                        const newSections = [...sections];
                        newSections[sIdx].fields = newSections[
                          sIdx
                        ].fields.filter((f) => f.id !== field.id);
                        setSections(newSections);
                      }}
                    >
                      <Trash2 size={16} color="#cbd5e1" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField(section.id, "number")}
                  >
                    <Plus size={14} className="mr-1" /> Dato
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField(section.id, "image")}
                  >
                    <ImageIcon size={14} className="mr-1" /> Foto
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={addSection}
            className={styles.addSectionBtn}
            variant="outline"
          >
            <Plus size={20} className="mr-2" /> Añadir Sección Técnica
          </Button>
        </div>
      </div>
    </div>
  );
}
