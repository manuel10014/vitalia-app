import { ProtocolField } from "@/hooks/useProtocols";

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

export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  businessName: string;
  taxId: string | null;
  contactInfo: {
    email: string;
    phone: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  assetId: string;
  protocolVersionId: string;
  createdById?: string; // Lo hacemos opcional por si el backend no siempre lo envía
  status: TestStatus;
  startedAt: string | null;
  finishedAt: string | null;
  metadata?: JsonValue | null;
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
  brand: string;
  model: string;
  serialNumber: string;
  internalCode: string;
  status: "CALIBRATED" | "EXPIRED" | "MAINTENANCE" | "OUT_OF_SERVICE";
  lastCalibration: string;
  nextCalibration: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}
