// Traducciones al español de los enums de estado que vienen del backend
// (Prisma los guarda en inglés — ver prisma/schema.prisma). Centralizado
// acá para no repetir el mismo diccionario en cada pantalla y para que no
// se cuele texto en inglés cuando aparece un status que ninguna pantalla
// tenía mapeado todavía.

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ASSIGNED: "Asignada",
  IN_PROGRESS: "En Progreso",
  REVIEW_PENDING: "Pendiente de Revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const ASSET_STATUS_LABELS: Record<string, string> = {
  OPERATIONAL: "Operativo",
  MAINTENANCE: "En Mantenimiento",
  DECOMMISSIONED: "Dado de Baja",
};

export const TEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Campo",
  PASSED: "Aprobado",
  FAILED: "Falla Crítica",
  DRAFT: "Borrador",
  SUBMITTED: "Por Revisar",
  UNDER_REVIEW: "En Revisión",
  APPROVED: "Certificado",
  REJECTED: "Rechazado",
  ISSUED: "Emitido",
};

export const SYNC_STATUS_LABELS: Record<string, string> = {
  SYNCED: "Sincronizado",
  PENDING: "Pendiente",
  FAILED: "Fallido",
};

export const REVIEW_DECISION_LABELS: Record<string, string> = {
  APPROVE: "Aprobar",
  REJECT: "Rechazar",
};

/**
 * Traduce un valor de estado usando el diccionario dado. Si el valor no
 * está mapeado (enum nuevo que todavía no se agregó acá), devuelve el
 * valor tal cual en vez de romper — pero eso debería ser la excepción, no
 * la regla; si ves texto en inglés en pantalla, es que falta agregarlo
 * arriba.
 */
export function translateStatus(
  map: Record<string, string>,
  value?: string | null,
): string {
  if (!value) return "—";
  return map[value] || value;
}
