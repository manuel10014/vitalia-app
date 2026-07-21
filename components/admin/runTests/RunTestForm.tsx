"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Hash,
  Type,
  Camera,
  AlertCircle,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Loader2,
  Plug,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { OrganizationProtocolVersion, CapturedValue } from "@/types";
import {
  isTechnicalMatrixSection,
  buildMatrixStorageKey,
  EVIDENCE_SUFFIX_BEFORE,
  EVIDENCE_SUFFIX_AFTER,
} from "@/lib/technicalMatrix";
import styles from "./RunTestForm.module.css";

export type FormState = Record<string, Record<string, CapturedValue>>;

interface RunTestFormProps {
  protocolVersion: OrganizationProtocolVersion;
  formData: FormState;
  handleInputChange: (
    sectionId: string,
    fieldName: string,
    value: CapturedValue,
  ) => void;
  numConductores?: number;
  fases?: string[];
  testRunId: string;
}

export const RunTestForm: React.FC<RunTestFormProps> = ({
  protocolVersion,
  formData,
  handleInputChange,
  numConductores = 1,
  fases = ["A", "B", "C"],
  testRunId,
}) => {
  // Claves (sectionId.storageKey) que est\u00e1n subi\u00e9ndose a S3 en este momento
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());

  // Sube la evidencia fotogr\u00e1fica real a /attachments/upload (S3) y guarda
  // la URL resultante en el formulario. Antes, el File capturado se quedaba
  // solo en el estado local de React y nunca se persist\u00eda.
  const capturePhoto = useCallback(
    async (sectionId: string, storageKey: string, file: File) => {
      const uploadKey = `${sectionId}.${storageKey}`;
      setUploadingKeys((prev) => new Set(prev).add(uploadKey));
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("testRunId", testRunId);
        form.append("fieldPath", uploadKey);
        // El backend sobreescribe url/mimeType con los datos reales del
        // archivo subido a S3, pero el DTO los exige presentes para validar.
        form.append("url", "https://evidencia.pendiente");
        form.append("mimeType", file.type || "image/jpeg");

        // No fijamos Content-Type a mano: el navegador debe generarlo con
        // el boundary correcto del multipart/form-data, si no el backend
        // (Multer) no puede parsear el body.
        const res = await api.post("/attachments/upload", form);

        handleInputChange(
          sectionId,
          storageKey,
          res.data?.url as CapturedValue,
        );
      } catch {
        toast.error("No se pudo subir la foto de evidencia. Intente de nuevo.");
      } finally {
        setUploadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(uploadKey);
          return next;
        });
      }
    },
    [testRunId, handleInputChange],
  );

  if (!protocolVersion?.schemaDefinition?.sections) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50">
        <AlertCircle className="text-amber-500 mb-2" size={32} />
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center">
          No hay esquema de captura definido
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {protocolVersion.schemaDefinition.sections.map((section) => {
        const isTechnicalMatrix = isTechnicalMatrixSection(section.title);

        return (
          <Card
            key={section.id}
            className="shadow-xl border-slate-200 overflow-hidden rounded-[2.5rem] border-2"
          >
            <CardHeader className="bg-slate-900 py-5 px-8 text-white flex flex-row justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  {isTechnicalMatrix ? (
                    <Layers size={24} />
                  ) : (
                    <ClipboardList size={24} />
                  )}
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                    {isTechnicalMatrix
                      ? "Matriz de Resultados"
                      : "Información de Campo"}
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                    {section.title}
                  </h3>
                </div>
              </div>
              {isTechnicalMatrix && (
                <Badge className="bg-blue-600 text-white font-black px-4 py-1">
                  {fases.length}F × {numConductores}H
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {isTechnicalMatrix ? (
                /* --- VISTA TÉCNICA: TABLA --- */
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase w-40 border-r border-slate-100">
                          Parámetro
                        </th>
                        {fases.map((fase) => (
                          <th
                            key={fase}
                            colSpan={numConductores}
                            className="p-4 text-center text-xs font-black text-slate-800 uppercase border-r border-slate-100 bg-blue-50/30"
                          >
                            Fase {fase}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="border-r border-slate-100"></th>
                        {fases.map((fase) =>
                          Array.from({ length: numConductores }).map((_, i) => (
                            <th
                              key={`${fase}-h${i}`}
                              className="p-3 text-[9px] font-bold text-slate-400 uppercase border-r border-slate-100 text-center"
                            >
                              H{i + 1}
                            </th>
                          )),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {section.fields.map((field) => (
                        <tr
                          key={field.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="p-6 border-r border-slate-100 bg-slate-50/20">
                            <Label className="text-xs font-black text-slate-700 uppercase leading-tight">
                              {field.label}
                              {field.unit && (
                                <span className="block text-[9px] text-blue-500 mt-1">
                                  {field.unit}
                                </span>
                              )}
                            </Label>
                          </td>
                          {fases.map((fase) =>
                            Array.from({ length: numConductores }).map(
                              (_, i) => {
                                const storageKey = buildMatrixStorageKey(
                                  field.id,
                                  fase,
                                  i + 1,
                                );
                                const value =
                                  formData[section.id]?.[storageKey] || "";
                                const isPhotoField =
                                  field.type === "camera" ||
                                  field.type === "image";
                                const isUploadingPhoto = uploadingKeys.has(
                                  `${section.id}.${storageKey}`,
                                );
                                const beforeKey = `${storageKey}${EVIDENCE_SUFFIX_BEFORE}`;
                                const afterKey = `${storageKey}${EVIDENCE_SUFFIX_AFTER}`;
                                const hasBefore =
                                  !!formData[section.id]?.[beforeKey];
                                const hasAfter =
                                  !!formData[section.id]?.[afterKey];
                                const isUploadingBefore = uploadingKeys.has(
                                  `${section.id}.${beforeKey}`,
                                );
                                const isUploadingAfter = uploadingKeys.has(
                                  `${section.id}.${afterKey}`,
                                );
                                // La evidencia es obligatoria: si ya hay un
                                // valor de medición pero falta alguna de las
                                // dos fotos, se marca visualmente.
                                const isEvidenceIncomplete =
                                  !!value && (!hasBefore || !hasAfter);
                                // ... dentro del map de fases y conductores en la tabla
                                return (
                                  <td
                                    key={storageKey}
                                    className="p-2 border-r border-slate-100 last:border-0"
                                  >
                                    {isPhotoField ? (
                                      <div className="flex justify-center">
                                        {/* Input de archivo oculto con captura de cámara */}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          capture="environment"
                                          className={styles.evidenceHiddenInput}
                                          id={`cam-${storageKey}`}
                                          disabled={isUploadingPhoto}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              void capturePhoto(
                                                section.id,
                                                storageKey,
                                                file,
                                              );
                                            }
                                            e.target.value = "";
                                          }}
                                        />
                                        <label
                                          htmlFor={`cam-${storageKey}`}
                                          className={`cursor-pointer p-2 rounded-lg transition-all ${
                                            isUploadingPhoto
                                              ? "bg-slate-100 text-slate-400"
                                              : value
                                                ? "bg-green-500 text-white shadow-md"
                                                : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500"
                                          }`}
                                        >
                                          {isUploadingPhoto ? (
                                            <Loader2
                                              size={18}
                                              className={styles.spinIcon}
                                            />
                                          ) : (
                                            <Camera size={18} />
                                          )}
                                        </label>
                                      </div>
                                    ) : (
                                      <div
                                        className={`${styles.matrixCellStack} ${
                                          isEvidenceIncomplete
                                            ? styles.matrixCellStackIncomplete
                                            : ""
                                        }`}
                                      >
                                        {/* Input normal para valores numéricos (Tensión, Fuga, etc.) */}
                                        <Input
                                          type={
                                            field.type === "number"
                                              ? "number"
                                              : "text"
                                          }
                                          value={value as string | number}
                                          placeholder="---"
                                          className="h-10 text-center font-black text-slate-800 border-none bg-transparent focus:ring-0 text-xs"
                                          onChange={(e) =>
                                            handleInputChange(
                                              section.id,
                                              storageKey,
                                              e.target.value,
                                            )
                                          }
                                        />

                                        {/* Evidencia fotográfica obligatoria: antes (conexión) y después (medición) */}
                                        <div className={styles.evidenceRow}>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className={
                                              styles.evidenceHiddenInput
                                            }
                                            id={`cam-${beforeKey}`}
                                            disabled={isUploadingBefore}
                                            onChange={(e) => {
                                              const file =
                                                e.target.files?.[0];
                                              if (file) {
                                                void capturePhoto(
                                                  section.id,
                                                  beforeKey,
                                                  file,
                                                );
                                              }
                                              e.target.value = "";
                                            }}
                                          />
                                          <label
                                            htmlFor={`cam-${beforeKey}`}
                                            title="Foto de la conexión (antes) — obligatoria"
                                            className={`${styles.evidenceButton} ${styles.evidenceButtonBefore} ${
                                              hasBefore
                                                ? styles.evidenceButtonCaptured
                                                : ""
                                            } ${
                                              isUploadingBefore
                                                ? styles.evidenceButtonUploading
                                                : ""
                                            }`}
                                          >
                                            {isUploadingBefore ? (
                                              <Loader2
                                                size={13}
                                                className={styles.spinIcon}
                                              />
                                            ) : (
                                              <Plug size={13} />
                                            )}
                                          </label>

                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className={
                                              styles.evidenceHiddenInput
                                            }
                                            id={`cam-${afterKey}`}
                                            disabled={isUploadingAfter}
                                            onChange={(e) => {
                                              const file =
                                                e.target.files?.[0];
                                              if (file) {
                                                void capturePhoto(
                                                  section.id,
                                                  afterKey,
                                                  file,
                                                );
                                              }
                                              e.target.value = "";
                                            }}
                                          />
                                          <label
                                            htmlFor={`cam-${afterKey}`}
                                            title="Foto de la medición (después) — obligatoria"
                                            className={`${styles.evidenceButton} ${styles.evidenceButtonAfter} ${
                                              hasAfter
                                                ? styles.evidenceButtonCaptured
                                                : ""
                                            } ${
                                              isUploadingAfter
                                                ? styles.evidenceButtonUploading
                                                : ""
                                            }`}
                                          >
                                            {isUploadingAfter ? (
                                              <Loader2
                                                size={13}
                                                className={styles.spinIcon}
                                              />
                                            ) : (
                                              <Gauge size={13} />
                                            )}
                                          </label>
                                        </div>
                                        {isEvidenceIncomplete && (
                                          <span
                                            className={styles.evidenceWarning}
                                          >
                                            <AlertTriangle size={10} />
                                            Falta evidencia
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                );
                              },
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* --- VISTA GENERAL: UBICACIÓN Y EVIDENCIA FOTOGRÁFICA --- */
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {section.fields.map((field) => {
                    const value = formData[section.id]?.[field.id] || "";
                    const isPhotoType =
                      field.type === "camera" || field.type === "image";
                    const isUploadingGeneralPhoto = uploadingKeys.has(
                      `${section.id}.${field.id}`,
                    );

                    return (
                      <div
                        key={field.id}
                        className={`space-y-2 text-left ${isPhotoType ? "col-span-full" : ""}`}
                      >
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          {isPhotoType ? (
                            <Camera size={12} />
                          ) : field.type === "number" ? (
                            <Hash size={12} />
                          ) : (
                            <Type size={12} />
                          )}
                          {field.label}
                        </Label>

                        <div className="relative">
                          {isPhotoType ? (
                            <div className="w-full">
                              {/* 📷 INPUT OCULTO QUE DISPARA LA CÁMARA */}
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment" // Fuerza apertura de cámara trasera en móviles
                                className={styles.evidenceHiddenInput}
                                id={`cam-${field.id}`}
                                disabled={isUploadingGeneralPhoto}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    void capturePhoto(
                                      section.id,
                                      field.id,
                                      file,
                                    );
                                  }
                                  e.target.value = "";
                                }}
                              />
                              <label
                                htmlFor={`cam-${field.id}`}
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                              >
                                {isUploadingGeneralPhoto ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2
                                      className={`text-blue-500 ${styles.spinIcon}`}
                                      size={32}
                                    />
                                    <span className="text-[10px] font-black text-blue-500 uppercase">
                                      Subiendo evidencia...
                                    </span>
                                  </div>
                                ) : value ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                      <ImageIcon size={32} />
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 uppercase">
                                      Imagen cargada
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <Camera
                                      className="text-slate-300 group-hover:text-blue-500 mb-3"
                                      size={40}
                                    />
                                    <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-600">
                                      Tomar Foto de Evidencia
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          ) : (
                            <>
                              <Input
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                value={value as string | number}
                                placeholder={`Ingrese ${field.label.toLowerCase()}`}
                                onChange={(e) =>
                                  handleInputChange(
                                    section.id,
                                    field.id,
                                    e.target.value,
                                  )
                                }
                                className="h-14 border-slate-200 rounded-2xl font-bold"
                              />
                              {field.unit && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
                                  {field.unit}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
