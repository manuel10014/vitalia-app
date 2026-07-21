import jsPDF from "jspdf";
import "jspdf-autotable";

// --- INTERFACES STRICT TYPING PARA VITALIA ---
interface CapturedValueObject {
  value: string | number | boolean;
  [key: string]: unknown;
}

type CapturedFieldValue = string | number | boolean | CapturedValueObject;

interface ProtocolData {
  capturedData?: Record<string, Record<string, CapturedFieldValue>>;
  [key: string]: unknown;
}

interface GlobalProtocol {
  name?: string;
}

interface OrganizationProtocol {
  globalProtocol?: GlobalProtocol;
}

interface ProtocolVersion {
  organizationProtocol?: OrganizationProtocol;
}

interface Project {
  name?: string;
}

interface WorkOrder {
  code?: string;
  project?: Project;
}

interface Asset {
  name?: string;
  tagId?: string;
}

interface TestRunMetadata {
  numConductores?: number;
  fases?: string[];
  [key: string]: unknown;
}

export interface TestRunReportInput {
  metadata?: TestRunMetadata | null;
  workOrder?: WorkOrder | null;
  asset?: Asset | null;
  protocolVersion?: ProtocolVersion | null;
  data?: ProtocolData | null;
  values?: Record<string, Record<string, CapturedFieldValue>> | null;
  finishedAt?: string | Date | null;
}

// --- GENERADOR CON TIPADO ESTRICTO ---
export const generateFrontendPDF = (testRun: TestRunReportInput): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const metadata = testRun?.metadata || {};
  const code = testRun?.workOrder?.code || "S-COD";
  const assetName = testRun?.asset?.name || "ACTIVO GENERAL";
  const protocolName =
    testRun?.protocolVersion?.organizationProtocol?.globalProtocol?.name ||
    "REPORTE TÉCNICO VLF";

  // Extraer las mediciones soportando tanto la tabla TestRunData como el fallback de values locales
  const capturedData = testRun?.data?.capturedData || testRun?.values || {};

  // --- 1. ENCABEZADO ESTILIZADO (Slate-900) ---
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("VITALIA • REPORTE TÉCNICO DE INGENIERÍA", 14, 15);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22); // Amber / Naranja de la marca
  doc.text(protocolName.toUpperCase(), 14, 25);

  let currentY = 45;

  // --- 2. TABLA: DATOS DE CONTEXTO ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // Azul Marino de Ingeniería
  doc.text("1. DATOS DE CONTEXTO OPERATIVO", 14, currentY);

  // 🟢 CORREGIDO: Definimos la firma exacta de la función en lugar de usar "Function"
  (
    doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }
  ).autoTable({
    startY: currentY + 3,
    theme: "striped",
    body: [
      ["Orden de Trabajo (OT):", code],
      [
        "Proyecto Asociado:",
        testRun?.workOrder?.project?.name || "No asignado",
      ],
      ["Activo Evaluado:", assetName],
      ["TAG Identificador:", testRun?.asset?.tagId || "---"],
      [
        "Fecha de Cierre:",
        testRun?.finishedAt
          ? new Date(testRun.finishedAt).toLocaleString()
          : new Date().toLocaleString(),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", width: 50 } },
  });

  currentY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // --- 3. TABLA: CONFIGURACIÓN DE RED ---
  doc.text("2. CONFIGURACIÓN DE RED Y TOPOLOGÍA", 14, currentY);
  doc.text("2. CONFIGURACIÓN DE RED Y TOPOLOGÍA", 14, currentY);

  // 🟢 CORREGIDO: Misma firma estricta para evitar el warning de ESLint
  (
    doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }
  ).autoTable({
    startY: currentY + 3,
    theme: "bordered",
    body: [
      [
        "Hilos por Fase Conectados en Paralelo:",
        `${metadata.numConductores || 1} Conductor(es)`,
      ],
      [
        "Fases Analizadas en el Sistema:",
        Array.isArray(metadata.fases)
          ? metadata.fases.join(" - ")
          : "A - B - C",
      ],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", width: 70 } },
  });

  currentY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // --- 4. TABLA DINÁMICA: MEDICIONES ADQUIRIDAS ---
  doc.text("3. MÉTRICAS DE AISLAMIENTO REGISTRADAS", 14, currentY);

  const metricsRows: string[][] = [];

  Object.entries(capturedData).forEach(([sectionTitle, fields]) => {
    if (fields && typeof fields === "object") {
      Object.entries(fields).forEach(([fieldLabel, valueObj]) => {
        // Desestructurar si viene como objeto { value: ... } o primitivo directo
        const finalValue =
          valueObj && typeof valueObj === "object" && "value" in valueObj
            ? (valueObj as CapturedValueObject).value
            : (valueObj as string | number | boolean);

        metricsRows.push([
          sectionTitle,
          fieldLabel,
          finalValue !== undefined && finalValue !== null
            ? String(finalValue)
            : "---",
        ]);
      });
    }
  });

  if (metricsRows.length > 0) {
    (
      doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }
    ).autoTable({
      startY: currentY + 3,
      head: [["Sección del Protocolo", "Parámetro Evaluado", "Valor Medido"]],
      body: metricsRows,
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 2: { fontStyle: "bold", textColor: [22, 163, 74] } },
    });
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "No se encontraron mediciones registradas en el snapshot.",
      14,
      currentY + 8,
    );
  }

  // Descarga inmediata del archivo en el navegador
  doc.save(`VITALIA-REPORTE-${code}.pdf`);
};
