// --- API & Auth ---
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

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

// --- User & Organization ---
export interface Role {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
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

// --- Client & Project ---
export interface ContactInfo {
  email: string;
  phone: string | number;
  name?: string;
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
  state: string;
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

// --- Assets & Equipment ---
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

// --- Work Orders ---
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

export interface WorkOrderService {
  id: string;
  organizationProtocol: {
    id: string;
    globalProtocol: {
      name: string;
    };
    versions: ProtocolVersion[];
  };
}

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
  plannedServices: WorkOrderService[];
}

// --- Protocols Definition ---
export interface ProtocolField {
  id: string; // ID único para mapear el valor capturado
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "file"
    | "image"
    | "signature"
    | "check"
    | "camera";
  required: boolean;
  unit?: string;
  options?: string[];
  step?: string | number;
  min?: number;
  max?: number;
}

export interface ProtocolSection {
  id: string;
  title: string; // Título de la sección (L1, L2, etc)
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
  targetField: string;
  expression: string;
  unit?: string;
  precision?: number;
}

export interface ProtocolRequirement {
  id: string;
  description: string;
  source: string;
  validationRules: {
    field: string;
    operator: ">" | "<" | "==" | "range";
    criticalValue: number | string;
    severityIfFailed: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  }[];
}

export interface PdfTemplateMapping {
  pageNumber: number;
  coordinates: { x: number; y: number };
  fieldId: string;
  fontSize?: number;
  alignment?: "left" | "center" | "right";
}

// --- Protocols Instances ---
export interface GlobalProtocol {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

export interface OrganizationProtocol {
  id: string;
  organizationId: string;
  globalProtocolId: string;
  isActive: boolean;
  globalProtocol: {
    name: string;
    category: string;
    code: string;
  };
  versions: ProtocolVersion[];
  createdAt: string;
}

export interface ProtocolVersion {
  id: string;
  organizationId: string;
  organizationProtocolId: string;
  versionNumber: number;
  schemaDefinition: ProtocolSchema;
  formulaDefinition?: FormulaDefinition[];
  requirements?: ProtocolRequirement[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  globalProtocol?: { name: string };
}

export interface OrganizationProtocolVersion extends ProtocolVersion {
  organizationProtocol: OrganizationProtocol;
  pdfTemplateMapping?: PdfTemplateMapping[];
}

export interface AdoptResponse {
  id: string;
  organizationId: string;
  globalProtocolId: string;
  activeVersionId: string;
}

// --- Test Runs & Execution ---
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

export type CapturedValue = string | number | boolean | CapturedDataRecord[];

export interface CapturedDataRecord {
  [key: string]: CapturedValue;
}

export interface TestRun {
  id: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  assetId: string;
  asset?: Asset;
  protocolVersionId: string;
  protocolVersion?: OrganizationProtocolVersion;
  status: TestStatus;
  startedAt: string | null;
  finishedAt: string | null;

  // Relación con los datos capturados (TestRunData)
  data?: {
    capturedData: Record<string, Record<string, CapturedValue>>;
    syncStatus: SyncStatus;
    capturedAt?: string;
  };

  // Relación con Equipos (TestRunEquipment)
  equipments?: {
    id: string;
    equipment: MeasurementEquipment;
  }[];

  // Metadata con estructura para conductores y revisión
  metadata?: {
    numConductores?: number;
    fases?: string[];
    review?: {
      signature: string;
      reviewedAt: string;
      comments?: string;
    };
    [key: string]: unknown; // Permite otros campos de JsonValue
  } | null;

  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TestRunEquipment {
  id: string;
  equipmentId?: string;
  equipment: MeasurementEquipment;
  roleInTest?: string | null;
}

export interface TestRunPayload {
  workOrderId: string;
  assetId: string;
  protocolVersionId: string;
  capturedData: CapturedDataRecord;
  status: "DRAFT" | "SUBMITTED";
}

// --- Reports & Signatures ---
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
  meta: ApiPaginationMeta;
}
