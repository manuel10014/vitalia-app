import { CapturedValue, ProtocolSchema } from "@/types";
// import type: evita un ciclo de import en tiempo de ejecución con
// RunTestForm.tsx (que a su vez importa funciones de este archivo) — solo
// se usa el tipo, se elimina por completo al compilar.
import type { FormState } from "@/components/admin/runTests/RunTestForm";

/**
 * Lógica compartida entre RunTestForm.tsx (captura) y RunTestExecution.tsx
 * (envío) para identificar la "matriz técnica" de mediciones y sus llaves
 * de almacenamiento. Vivía duplicada/implícita en un solo componente; se
 * extrae aquí para que la validación de evidencia obligatoria (antes/
 * después) use exactamente el mismo criterio que la UI que la captura.
 */

export const EVIDENCE_SUFFIX_BEFORE = "_foto_antes"; // foto de la conexión
export const EVIDENCE_SUFFIX_AFTER = "_foto_despues"; // foto de la medición

// Nota: se usa \p{M} (cualquier marca combinada, ej. tildes tras NFD) en vez
// del rango ̀-ͯ escrito a mano, para evitar problemas de
// codificación al escribir el archivo y porque cubre más casos.
export function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function isTechnicalMatrixSection(title: string): boolean {
  const t = normalizeText(title);
  return (
    (t.includes("medicion") || t.includes("vlf") || t.includes("aislamiento")) &&
    !t.includes("ubicacion")
  );
}

export function buildMatrixStorageKey(
  fieldId: string,
  fase: string,
  conductorIndex: number,
): string {
  return `${fieldId}_${fase.toLowerCase()}_c${conductorIndex}`;
}

export interface MissingEvidenceItem {
  sectionTitle: string;
  fieldLabel: string;
  fase: string;
  conductor: number;
}

/**
 * Recorre la matriz técnica y devuelve, para cada medición que ya tiene un
 * valor capturado, cuáles le falta: foto de conexión (antes) y/o foto de
 * medición (después). Ambas son obligatorias para poder enviar el ensayo.
 * Los campos que YA son de tipo foto/cámara no requieren evidencia
 * adicional (ellos mismos son la evidencia).
 *
 * `schema` acepta también un string JSON (como schemaDefinition puede venir
 * del backend) — se parsea igual que en useDynamicForm.ts.
 */
export function findMissingEvidence(
  schema: ProtocolSchema | string | undefined | null,
  formData: FormState,
  fases: string[],
  numConductores: number,
): MissingEvidenceItem[] {
  const parsedSchema: ProtocolSchema | null =
    typeof schema === "string"
      ? (() => {
          try {
            return JSON.parse(schema) as ProtocolSchema;
          } catch {
            return null;
          }
        })()
      : (schema ?? null);

  if (!parsedSchema?.sections) return [];

  const missing: MissingEvidenceItem[] = [];

  for (const section of parsedSchema.sections) {
    if (!isTechnicalMatrixSection(section.title)) continue;

    for (const field of section.fields) {
      const isPhotoField = field.type === "camera" || field.type === "image";
      if (isPhotoField) continue;

      for (const fase of fases) {
        for (let i = 1; i <= numConductores; i++) {
          const storageKey = buildMatrixStorageKey(field.id, fase, i);
          const value = formData[section.id]?.[storageKey];
          const hasValue =
            value !== undefined && value !== null && value !== "";
          if (!hasValue) continue;

          const beforeVal: CapturedValue | undefined =
            formData[section.id]?.[`${storageKey}${EVIDENCE_SUFFIX_BEFORE}`];
          const afterVal: CapturedValue | undefined =
            formData[section.id]?.[`${storageKey}${EVIDENCE_SUFFIX_AFTER}`];

          if (!beforeVal || !afterVal) {
            missing.push({
              sectionTitle: section.title,
              fieldLabel: field.label,
              fase,
              conductor: i,
            });
          }
        }
      }
    }
  }

  return missing;
}
