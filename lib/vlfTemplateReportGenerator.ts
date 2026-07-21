import ExcelJS from "exceljs";
import type { TestRun, ProtocolSection } from "@/types";

const TEMPLATE_URL = "/templates/FO-INDE-013-INFORME-VLF-template-v3.xlsx";

const normalizeText = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const NUMERO_ES = [
  "cero",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
];
const numeroEnLetras = (n: number) => NUMERO_ES[n] ?? String(n);

type CapturedData = Record<string, Record<string, unknown>>;

const rawValue = (v: unknown): string | number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "object" && "value" in (v as object)) {
    const inner = (v as { value: unknown }).value;
    return inner === undefined || inner === null || inner === ""
      ? undefined
      : (inner as string | number);
  }
  return v as string | number;
};

// Encuentra, dentro de las secciones del protocolo, el field.id cuyo label calza con alguna
// de las palabras clave (comparación normalizada, sin tildes).
function findFieldId(
  sections: ProtocolSection[],
  keywords: string[],
): { sectionId: string; fieldId: string } | null {
  for (const section of sections) {
    for (const field of section.fields) {
      const label = normalizeText(field.label);
      if (keywords.some((k) => label.includes(k))) {
        return { sectionId: section.id, fieldId: field.id };
      }
    }
  }
  return null;
}

function isTechnicalMatrix(title: string) {
  const t = normalizeText(title);
  return (
    (t.includes("medicion") ||
      t.includes("vlf") ||
      t.includes("aislamiento") ||
      t.includes("evidencia")) &&
    !t.includes("ubicacion")
  );
}

export async function generateVLFReportFromTemplate(
  testRun: TestRun,
): Promise<void> {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) {
    throw new Error("No se pudo cargar la plantilla de informe VLF.");
  }
  const arrayBuffer = await res.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const ws = workbook.worksheets[0];

  const client = testRun.workOrder?.project?.client;
  const asset = testRun.asset;
  const specs = (asset?.specs || {}) as Record<string, unknown>;
  const metadata = testRun.metadata || {};
  const fases = (metadata.fases as string[]) || ["A", "B", "C"];
  const numConductores = (metadata.numConductores as number) || 1;
  const equipment = testRun.equipments?.[0]?.equipment;
  const capturedData = (testRun.data?.capturedData || {}) as CapturedData;
  const sections = (testRun.protocolVersion?.schemaDefinition?.sections ||
    []) as ProtocolSection[];

  const setCell = (coord: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return;
    ws.getCell(coord).value = value;
  };

  // --- INFORMACIÓN DEL CLIENTE ---
  setCell(
    "B7",
    `INF-${testRun.workOrder?.code || "SN"}-${asset?.tagId || testRun.id.slice(0, 8).toUpperCase()}-VLF`,
  );
  setCell(
    "N7",
    testRun.finishedAt
      ? new Date(testRun.finishedAt).toLocaleDateString("es-CO")
      : new Date(testRun.createdAt).toLocaleDateString("es-CO"),
  );
  setCell("Z7", client?.city);
  setCell("B9", client?.businessName);
  // Dirección = sitio del ensayo (orden de trabajo); si no existe, se usa la dirección del cliente
  setCell("N9", testRun.workOrder?.address || client?.address);
  setCell(
    "Z9",
    client?.contactPosition
      ? `${client?.contactName} (${client.contactPosition})`
      : client?.contactName,
  );
  setCell("B11", client?.email);
  setCell("N11", client?.phone);

  // --- INFORMACIÓN DEL CABLE ---
  setCell(
    "B15",
    (specs["Tipo de aislamiento"] || specs["Aislamiento"]) as
      | string
      | undefined,
  );
  setCell("N15", specs["Tensión nominal [kV]"] as string | number | undefined);
  setCell(
    "Z15",
    (specs["Calibre [AWG/MCM]"] || specs["Calibre [AWG]"]) as
      | string
      | undefined,
  );
  setCell(
    "Z19",
    `${numeroEnLetras(fases.length)} (${numConductores} Conductor${numConductores > 1 ? "es" : ""} por Fase)`,
  );

  // Ubicación / longitud / inicio / final (sección general, no matricial)
  const generalSections = sections.filter(
    (s) => !isTechnicalMatrix(s.title),
  );
  const inicio = findFieldId(generalSections, ["inicio del conductor"]);
  const final = findFieldId(generalSections, ["final del conductor"]);
  if (inicio) {
    setCell(
      "B19",
      rawValue(capturedData[inicio.sectionId]?.[inicio.fieldId]) as string,
    );
  }
  if (final) {
    setCell(
      "N19",
      rawValue(capturedData[final.sectionId]?.[final.fieldId]) as string,
    );
  }

  // --- SECCIÓN MATRICIAL (mediciones por fase/conductor) ---
  const matrixSections = sections.filter((s) => isTechnicalMatrix(s.title));
  const longitudField = findFieldId(matrixSections, ["longitud"]);
  const tensionField = findFieldId(matrixSections, [
    "tension de ensayo",
    "tension",
  ]);
  const duracionField = findFieldId(matrixSections, ["duracion"]);
  const capacitanciaField = findFieldId(matrixSections, ["capacitancia"]);
  const corrienteField = findFieldId(matrixSections, [
    "corriente de fuga",
    "corriente",
  ]);
  const resultadoField = findFieldId(matrixSections, ["resultado"]);

  const findAnyValue = (
    field: { sectionId: string; fieldId: string } | null,
  ): string | number | undefined => {
    if (!field) return undefined;
    const sectionData = capturedData[field.sectionId] || {};
    for (const f of fases) {
      for (let c = 1; c <= numConductores; c++) {
        const v = rawValue(sectionData[`${field.fieldId}_${f.toLowerCase()}_c${c}`]);
        if (v !== undefined) return v;
      }
    }
    return undefined;
  };

  setCell(
    "B17",
    longitudField
      ? (() => {
          const v = findAnyValue(longitudField);
          return v !== undefined ? `${v} m` : undefined;
        })()
      : undefined,
  );

  setCell("P23", findAnyValue(tensionField));

  const durations = new Set<string>();
  if (duracionField) {
    const sectionData = capturedData[duracionField.sectionId] || {};
    for (const f of fases) {
      for (let c = 1; c <= numConductores; c++) {
        const v = rawValue(
          sectionData[`${duracionField.fieldId}_${f.toLowerCase()}_c${c}`],
        );
        if (v !== undefined) durations.add(String(v));
      }
    }
  }
  setCell("AE23", Array.from(durations).join("-"));

  if (equipment) {
    setCell("B23", equipment.name);
    setCell(
      "I23",
      [equipment.brand, equipment.model].filter(Boolean).join(" ") +
        (equipment.serialNumber ? `/${equipment.serialNumber}` : ""),
    );
  }
  // Forma de onda: por defecto A.C. (VLF estándar) salvo que se indique lo contrario en metadata
  ws.getCell("Y23").value = "X";

  // Filas fijas de la plantilla: FASE {letra}{n}-TIERRA, filas 28 a 39 (3 fases x 4 conductores)
  const templateRows: { row: number; fase: string; conductor: number }[] = [];
  let r = 28;
  for (const f of ["A", "B", "C"]) {
    for (let c = 1; c <= 4; c++) {
      templateRows.push({ row: r, fase: f, conductor: c });
      r++;
    }
  }

  let allApproved = true;
  let anyMeasurement = false;

  for (const { row, fase, conductor } of templateRows) {
    if (!fases.includes(fase) || conductor > numConductores) continue;
    const suffix = `${fase.toLowerCase()}_c${conductor}`;

    const tension = tensionField
      ? rawValue(
          capturedData[tensionField.sectionId]?.[
            `${tensionField.fieldId}_${suffix}`
          ],
        )
      : undefined;
    const duracion = duracionField
      ? rawValue(
          capturedData[duracionField.sectionId]?.[
            `${duracionField.fieldId}_${suffix}`
          ],
        )
      : undefined;
    const capacitancia = capacitanciaField
      ? rawValue(
          capturedData[capacitanciaField.sectionId]?.[
            `${capacitanciaField.fieldId}_${suffix}`
          ],
        )
      : undefined;
    const corriente = corrienteField
      ? rawValue(
          capturedData[corrienteField.sectionId]?.[
            `${corrienteField.fieldId}_${suffix}`
          ],
        )
      : undefined;
    const resultado = resultadoField
      ? rawValue(
          capturedData[resultadoField.sectionId]?.[
            `${resultadoField.fieldId}_${suffix}`
          ],
        )
      : undefined;

    if (
      tension === undefined &&
      duracion === undefined &&
      capacitancia === undefined &&
      corriente === undefined
    ) {
      continue;
    }

    anyMeasurement = true;
    setCell(`L${row}`, tension);
    setCell(`Q${row}`, duracion);
    setCell(`V${row}`, capacitancia);
    setCell(`AD${row}`, corriente);

    if (resultado && !normalizeText(String(resultado)).includes("aprobado")) {
      allApproved = false;
    }
  }

  // Marca general de cumplimiento (SI/NO) según los resultados capturados
  if (anyMeasurement) {
    if (allApproved) {
      ws.getCell("C45").value = "X";
    } else {
      ws.getCell("I45").value = "X";
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FO-INDE-013-INFORME-VLF-${testRun.workOrder?.code || testRun.id.slice(0, 8)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
