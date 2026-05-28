"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileDown, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TestRun, ProtocolSection, ProtocolField } from "@/types";
import styles from "./ReportPreview.module.css";

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  testRun: TestRun | null;
}

export function ReportPreview({
  isOpen,
  onClose,
  testRun,
}: ReportPreviewProps) {
  if (!testRun) return null;

  // Extraemos secciones del esquema definido en el protocolo
  const sections: ProtocolSection[] =
    testRun.protocolVersion?.schemaDefinition?.sections || [];

  // Extraemos datos capturados
  const capturedData = testRun.data?.capturedData || {};

  // Metadatos de configuración de red
  const fases = testRun.metadata?.fases || ["A", "B", "C"];
  const numConductores = testRun.metadata?.numConductores || 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[95vh] p-0 border-none rounded-[2rem] overflow-hidden flex flex-col">
        <ScrollArea className={styles.reportContainer}>
          <div className={styles.reportWrapper} id="printable-area">
            {/* CABECERA */}
            <header className={styles.header}>
              <div className={styles.titleGroup}>
                <h1>Certificado de Ensayo Eléctrico</h1>
                <div className={styles.idBadge}>
                  ID: {testRun.id.split("-")[0].toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] mb-1 uppercase">
                  <ShieldCheck size={14} /> Integridad Verificada
                </div>
                <p className={styles.label}>Emisión</p>
                <p className={styles.value}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </header>

            {/* GRID DE INFORMACIÓN DE OBRA */}
            <div className={styles.infoGrid}>
              <div className={styles.infoBlock}>
                <h3>Localización y Cliente</h3>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Cliente:</span>
                  <span className={styles.value}>
                    {testRun.workOrder?.project?.client?.businessName || "---"}
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Proyecto:</span>
                  <span className={styles.value}>
                    {testRun.workOrder?.project?.name || "---"}
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>OT Ref:</span>
                  <span className={styles.value}>
                    {testRun.workOrder?.code || "---"}
                  </span>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <h3>Especificaciones de Activo</h3>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Nombre:</span>
                  <span className={styles.value}>
                    {testRun.asset?.name || "---"}
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>TAG/ID:</span>
                  <span className={styles.value}>
                    {testRun.asset?.tagId || "---"}
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Red:</span>
                  <span className={styles.value}>
                    {fases.length} Fases / {numConductores} Hilos
                  </span>
                </div>
              </div>
            </div>

            {/* MATRIZ TÉCNICA DE RESULTADOS */}
            {sections.map((section) => (
              <div key={section.id} className={styles.tableContainer}>
                <div className={styles.tableTitle}>{section.title}</div>
                <table className={styles.techTable}>
                  <thead>
                    <tr>
                      <th className={styles.paramName}>Parámetro de Prueba</th>
                      {fases.map((fase) => (
                        <th key={fase} colSpan={numConductores}>
                          Fase {fase}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.fields.map((field: ProtocolField) => (
                      <tr key={field.id}>
                        <td className={styles.paramName}>
                          {field.label} {field.unit && `(${field.unit})`}
                        </td>
                        {fases.map((fase) =>
                          Array.from({ length: numConductores }).map((_, i) => {
                            const dataKey = `${field.id}_${fase.toLowerCase()}_c${i + 1}`;
                            const val = capturedData[section.id]?.[dataKey];
                            return (
                              <td key={dataKey}>
                                {val !== undefined && val !== null
                                  ? String(val)
                                  : "---"}
                              </td>
                            );
                          }),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* PANEL DE VALIDACIÓN LEGAL */}
            <div className={styles.signatureGrid}>
              <div className={styles.sigLine}>
                <p className={styles.sigName}>
                  {testRun.createdBy?.fullName || "Firma Digital"}
                </p>
                <p className={styles.sigRole}>
                  Ingeniero Responsable de Pruebas
                </p>
              </div>
              <div className={styles.sigLine}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {testRun.status === "APPROVED" ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : null}
                  <p className={styles.sigName}>
                    {testRun.status === "APPROVED"
                      ? "Validado por Interventoría"
                      : "Pendiente de Aprobación"}
                  </p>
                </div>
                <p className={styles.sigRole}>Aprobación y Visto Bueno</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* ACCIONES DEL MODAL */}
        <DialogFooter className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold"
          >
            Cerrar Vista
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="rounded-xl font-bold gap-2"
          >
            <Printer size={16} /> Imprimir Certificado
          </Button>
          <Button className="bg-slate-900 text-white rounded-xl font-black gap-2 px-6">
            <FileDown size={16} /> Exportar Reporte Final
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
