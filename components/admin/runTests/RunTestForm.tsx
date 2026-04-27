"use client";

import React from "react";
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
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { OrganizationProtocolVersion, CapturedValue } from "@/types";

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
}

export const RunTestForm: React.FC<RunTestFormProps> = ({
  protocolVersion,
  formData,
  handleInputChange,
  numConductores = 1,
  fases = ["A", "B", "C"],
}) => {
  const normalizeText = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

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
        const sTitle = normalizeText(section.title);

        const isTechnicalMatrix =
          (sTitle.includes("medicion") ||
            sTitle.includes("vlf") ||
            sTitle.includes("aislamiento")) &&
          !sTitle.includes("ubicacion");

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
                                const storageKey = `${field.id}_${fase.toLowerCase()}_c${i + 1}`;
                                const value =
                                  formData[section.id]?.[storageKey] || "";
                                // ... dentro del map de fases y conductores en la tabla
                                return (
                                  <td
                                    key={storageKey}
                                    className="p-2 border-r border-slate-100 last:border-0"
                                  >
                                    {field.type === "camera" ||
                                    field.type === "image" ? (
                                      <div className="flex justify-center">
                                        {/* Input de archivo oculto con captura de cámara */}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          capture="environment"
                                          className="hidden"
                                          id={`cam-${storageKey}`}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleInputChange(
                                                section.id,
                                                storageKey,
                                                file as unknown as CapturedValue,
                                              );
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`cam-${storageKey}`}
                                          className={`cursor-pointer p-2 rounded-lg transition-all ${
                                            value
                                              ? "bg-green-500 text-white shadow-md"
                                              : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500"
                                          }`}
                                        >
                                          <Camera
                                            size={18}
                                            className={
                                              value ? "animate-pulse" : ""
                                            }
                                          />
                                        </label>
                                      </div>
                                    ) : (
                                      /* Input normal para valores numéricos (Tensión, Fuga, etc.) */
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
                                className="hidden"
                                id={`cam-${field.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleInputChange(
                                      section.id,
                                      field.id,
                                      file as unknown as CapturedValue,
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`cam-${field.id}`}
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                              >
                                {value ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                      <ImageIcon size={32} />
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 uppercase">
                                      Imagen lista para enviar
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
