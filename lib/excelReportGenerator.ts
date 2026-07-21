import * as XLSX from "xlsx";
import type { TestRunReportInput } from "./reportGenerator";

// --- GENERADOR DE EXCEL A PARTIR DE LA MISMA DATA DEL TESTRUN (petición GET /test-runs/:id) ---
export const generateFrontendExcel = (testRun: TestRunReportInput): void => {
  const metadata = testRun?.metadata || {};
  const code = testRun?.workOrder?.code || "S-COD";
  const assetName = testRun?.asset?.name || "ACTIVO GENERAL";
  const protocolName =
    testRun?.protocolVersion?.organizationProtocol?.globalProtocol?.name ||
    "REPORTE TÉCNICO VLF";

  // Extraer las mediciones soportando tanto la tabla TestRunData como el fallback de values locales
  const capturedData = testRun?.data?.capturedData || testRun?.values || {};

  const wb = XLSX.utils.book_new();

  // --- HOJA 1: DATOS DE CONTEXTO OPERATIVO Y CONFIGURACIÓN DE RED ---
  const contextRows: (string | number)[][] = [
    ["VITALIA • REPORTE TÉCNICO DE INGENIERÍA"],
    [protocolName.toUpperCase()],
    [],
    ["Orden de Trabajo (OT):", code],
    ["Proyecto Asociado:", testRun?.workOrder?.project?.name || "No asignado"],
    ["Activo Evaluado:", assetName],
    ["TAG Identificador:", testRun?.asset?.tagId || "---"],
    [
      "Fecha de Cierre:",
      testRun?.finishedAt
        ? new Date(testRun.finishedAt).toLocaleString()
        : new Date().toLocaleString(),
    ],
    [],
    [
      "Hilos por Fase Conectados en Paralelo:",
      `${metadata.numConductores || 1} Conductor(es)`,
    ],
    [
      "Fases Analizadas en el Sistema:",
      Array.isArray(metadata.fases) ? metadata.fases.join(" - ") : "A - B - C",
    ],
  ];
  const contextSheet = XLSX.utils.aoa_to_sheet(contextRows);
  contextSheet["!cols"] = [{ wch: 38 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, contextSheet, "Contexto");

  // --- HOJA 2: MÉTRICAS DE AISLAMIENTO REGISTRADAS ---
  const metricsHeader = [
    "Sección del Protocolo",
    "Parámetro Evaluado",
    "Valor Medido",
  ];
  const metricsRows: (string | number)[][] = [];

  Object.entries(capturedData).forEach(([sectionTitle, fields]) => {
    if (fields && typeof fields === "object") {
      Object.entries(fields as Record<string, unknown>).forEach(
        ([fieldLabel, valueObj]) => {
          // Desestructurar si viene como objeto { value: ... } o primitivo directo
          const finalValue =
            valueObj && typeof valueObj === "object" && "value" in (valueObj as object)
              ? (valueObj as { value: unknown }).value
              : valueObj;

          metricsRows.push([
            sectionTitle,
            fieldLabel,
            finalValue !== undefined && finalValue !== null
              ? String(finalValue)
              : "---",
          ]);
        },
      );
    }
  });

  const metricsSheet = XLSX.utils.aoa_to_sheet([
    metricsHeader,
    ...(metricsRows.length > 0
      ? metricsRows
      : [["Sin mediciones registradas en el snapshot.", "", ""]]),
  ]);
  metricsSheet["!cols"] = [{ wch: 30 }, { wch: 44 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, metricsSheet, "Mediciones");

  // Descarga inmediata del archivo en el navegador
  XLSX.writeFile(wb, `VITALIA-REPORTE-${code}.xlsx`);
};
