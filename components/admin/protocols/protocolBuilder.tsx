"use client";

import { useState, useEffect } from "react";
import { useProtocols } from "@/hooks/useProtocols";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { ProtocolPreview } from "./protocolPreview";
import styles from "./protocolBuilder.module.css";
import { toast } from "sonner";

interface Field {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "check";
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

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: "Nueva Sección",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const addField = (sectionId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            fields: [
              ...s.fields,
              {
                id: crypto.randomUUID(),
                label: "Nuevo Campo",
                type: "number",
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
      toast.error("No se pudo identificar el protocolo de la organización");
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
        <div className={styles.titleGroup}>
          <h2>Diseñador de Protocolo</h2>
          <p className={styles.versionText}>
            Versión: v{version?.versionNumber} - {version?.globalProtocol?.name}
          </p>
        </div>
        <Button
          onClick={saveChanges}
          disabled={updateSchema.isPending}
          className={styles.saveBtn}
          style={{ backgroundColor: "#10b981" }}
        >
          <Save size={16} className="mr-2" />
          {updateSchema.isPending ? "Guardando..." : "Publicar Cambios"}
        </Button>
      </header>

      <div className={styles.mainGrid}>
        {/* LADO IZQUIERDO: EDITOR */}
        <div className={styles.editorArea}>
          {sections.map((section, sIdx) => (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical size={18} color="#cbd5e1" />
                  <input
                    className={styles.sectionTitleInput}
                    value={section.title}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[sIdx].title = e.target.value;
                      setSections(newSections);
                    }}
                  />
                </div>
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

              <div className="p-6 space-y-4">
                {section.fields.map((field, fIdx) => (
                  <div key={field.id} className={styles.fieldRow}>
                    <div className={styles.fieldLabelGroup}>
                      <span className={styles.fieldMeta}>Etiqueta</span>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sIdx].fields[fIdx].label = e.target.value;
                          setSections(newSections);
                        }}
                      />
                    </div>
                    <div className={styles.unitWrapper}>
                      <span className={styles.fieldMeta}>Unidad</span>
                      <Input
                        value={field.unit || ""}
                        placeholder="V, A, °C"
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

                <Button
                  variant="outline"
                  className={styles.addBtn}
                  onClick={() => addField(section.id)}
                >
                  <Plus size={16} className="mr-2" /> Añadir Parámetro
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addSection} className={styles.addSectionBtn}>
            <Plus size={24} className="mr-2" /> CREAR NUEVA SECCIÓN
          </Button>
        </div>

        {/* LADO DERECHO: PREVIEW */}
        <div className={styles.sidebarPreview}>
          <ProtocolPreview
            sections={sections}
            protocolName={version?.globalProtocol?.name || "Protocolo Vitalia"}
          />
        </div>
      </div>
    </div>
  );
}
