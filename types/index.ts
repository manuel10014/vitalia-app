import { OrganizationProtocol } from "@/hooks/useProtocols";

export interface ApiPaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export interface Protocol {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  version: number;
  fields: ProtocolField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserRole {
  id: string;
  roleId: string;
  role: {
    name: string;
    key: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  organizationId: string;
  professionalLicense?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  email: string;
  phone: string | number;
  name?: string;
}

export interface ContactInfo {
  alternativeEmail?: string;
  notes?: string;
  internalCode?: string;
}

export interface Client {
  id: string;
  businessName: string;
  taxId: string;
  isActive: boolean;

  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;

  contactPosition?: string | null;
  contactInfo?: ContactInfo | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string | null;
  clientId: string;
  isActive: boolean;
  geoLocation: { lat: number; lng: number } | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export type AssetStatus = "OPERATIONAL" | "MAINTENANCE" | "DECOMMISSIONED";

export interface Asset {
  id: string;
  tagId: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  serialNumber?: string | null;
  locationDescription?: string | null;
  projectId: string;
  status: AssetStatus;
  specs: Record<string, unknown>;
  project?: {
    id: string;
    name: string;
    code: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "DRAFT"
  | "ASSIGNED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "REVIEW_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface WorkOrder {
  id: string;
  projectId: string;
  code: string;
  createdById: string;
  assignedTechId: string | null;
  status: OrderStatus;
  scheduledDate: string | null;
  metadata: JsonValue | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  technician?: User | null;
  createdBy?: User;
}

export type TestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PASSED"
  | "FAILED";

export type SyncStatus = "SYNCED" | "PENDING" | "FAILED";

// Unificamos TestRun para que tenga tanto la metadata como los valores capturados
export interface TestRun {
  id: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  assetId: string;
  protocolVersionId: string;
  createdById?: string; // Lo hacemos opcional por si el backend no siempre lo envía
  status: TestStatus;
  startedAt: string | null;
  finishedAt: string | null;
  metadata?: JsonValue | null;
  protocolVersion?: OrganizationProtocolVersion;
  values: Record<string, unknown>; // El campo que usa tu formulario de "Ejecutar Prueba"
  asset?: Asset;
  protocol?: {
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Unificamos ReportSnapshot
export interface ReportSnapshot {
  id: string;
  testRunId: string;
  workOrderId: string;
  reportName: string;
  versionNumber?: number;
  snapshotData: Record<string, unknown>;
  snapshotHash?: string;
  pdfUrl: string | null;
  issuedAt: string | null;
  createdAt: string;
  testRun?: TestRun;
}

export interface Signature {
  id: string;
  reportSnapshotId: string;
  signerUserId: string | null;
  signerName: string;
  signerRoleLabel: string;
  signatureImageUrl: string | null;
  signatureHash: string;
  signedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface MeasurementEquipment {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  internalCode: string | null;

  lastCalibrationAt: string | null;
  calibrationDueAt: string | null;
  certificateNumber: string | null;
  certificateUrl: string | null;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CapturedValue = string | number | boolean | CapturedDataRecord[];

export interface CapturedDataRecord {
  [key: string]: CapturedValue;
}

export interface TestRunPayload {
  workOrderId: string;
  assetId: string;
  protocolVersionId: string;
  capturedData: CapturedDataRecord;
  status: "DRAFT" | "SUBMITTED";
}

export interface ProtocolField {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "file"
    | "signature";
  required: boolean;
  options?: string[]; // Para campos tipo 'select'
  step?: string | number;
  min?: number;
  max?: number;
}

export interface ProtocolSection {
  id: string;
  label: string;
  fields: ProtocolField[];
  type?: "array" | "object";
}

export interface ProtocolSchema {
  protocol_name: string;
  version: string;
  sections: ProtocolSection[];
  globalRules?: {
    requiresCalibration?: boolean;
    autoCalculateDeltaT?: boolean;
  };
}

export interface FormulaDefinition {
  targetField: string; // Campo donde se guarda el resultado (ej: delta_temp_c)
  expression: string; // String de la fórmula (ej: "temp_maxima_c - temp_referencia_c")
  unit?: string; // Unidad de medida (ej: °C)
  precision?: number; // Cantidad de decimales
}

// 2. Tipado para requisitos de cumplimiento (Normas/Validaciones)
export interface ProtocolRequirement {
  id: string;
  description: string;
  source: string; // Norma asociada (ej: ISO 18434-1)
  validationRules: {
    field: string;
    operator: ">" | "<" | "==" | "range";
    criticalValue: number | string;
    severityIfFailed: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  }[];
}

// 3. Tipado para el mapeo visual en el PDF final
export interface PdfTemplateMapping {
  pageNumber: number;
  coordinates: { x: number; y: number };
  fieldId: string; // Mapeo directo al JSON Schema
  fontSize?: number;
  alignment?: "left" | "center" | "right";
}

export interface OrganizationProtocolVersion {
  id: string;
  organizationId: string;
  organizationProtocolId: string;
  versionNumber: number;
  schemaDefinition: ProtocolSchema;
  formulaDefinition?: FormulaDefinition[];
  requirements?: ProtocolRequirement[];
  pdfTemplateMapping?: PdfTemplateMapping[];
  isActive: boolean;
  organizationProtocol: OrganizationProtocol;
  createdAt: string;
  updatedAt: string;
}
