"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Info, Camera, ChevronDown } from "lucide-react";
import styles from "./protocolPreview.module.css";
import { ProtocolField, ProtocolSection } from "@/types";

interface PreviewProps {
  sections: ProtocolSection[];
  protocolName: string;
}

export function ProtocolPreview({ sections, protocolName }: PreviewProps) {
  return (
    <div className={styles.previewWrapper}>
      <div className={styles.modeBadge}>
        <Smartphone size={12} /> Modo Previsualización de Campo
      </div>

      <div className={styles.phoneFrame}>
        <div className={styles.notch} />

        <div className={styles.screen}>
          <header className={styles.header}>
            <h3 className={styles.protocolTitle}>{protocolName}</h3>
            <p className={styles.versionTag}>Vitalia Field Ops v1.0</p>
          </header>

          <div className={styles.scrollableContent}>
            {sections.length === 0 ? (
              <div className={styles.emptyState}>
                <Info size={40} />
                <p className={styles.emptyText}>
                  Agregue secciones para simular el formulario
                </p>
              </div>
            ) : (
              sections.map((section: ProtocolSection) => (
                <div key={section.id} className={styles.sectionCard}>
                  <h4 className={styles.sectionTitle}>{section.title}</h4>

                  <div className={styles.fieldsContainer}>
                    {section.fields.map((field: ProtocolField) => (
                      <div key={field.id} className={styles.fieldGroup}>
                        <Label className={styles.fieldLabel}>
                          {field.label}{" "}
                          {field.required && (
                            <span className={styles.requiredAsterisk}>*</span>
                          )}
                        </Label>

                        <div className={styles.inputWrapper}>
                          {/*  Renderizado condicional según tipo de campo */}

                          {field.type === "image" ? (
                            <div className={styles.mockImageUpload}>
                              <Camera size={20} className="text-slate-400" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                Capturar Evidencia
                              </span>
                            </div>
                          ) : field.type === "select" ? (
                            <div className={styles.mockSelect}>
                              <span className="text-slate-400 italic">
                                Seleccionar opción...
                              </span>
                              <ChevronDown
                                size={14}
                                className="text-slate-400"
                              />
                            </div>
                          ) : (
                            <>
                              <Input
                                disabled
                                placeholder={
                                  field.type === "number" ? "0.00" : "---"
                                }
                                className={styles.mockInput}
                              />
                              {field.unit && (
                                <span className={styles.unitBadge}>
                                  {field.unit}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.mockFooter}>
          <div className={styles.mockButton}>Finalizar Ensayo</div>
        </div>
      </div>
    </div>
  );
}
