import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse, ApiPaginationMeta } from "@/types";

// --- Interfaces de Dominio ---

export interface ProtocolField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "check" | "image";
  unit?: string;
  required: boolean;
  options?: string[];
}

export interface ProtocolSection {
  id: string;
  title: string;
  fields: ProtocolField[];
}

export interface ProtocolSchema {
  sections: ProtocolSection[];
}

export interface ProtocolVersion {
  id: string;
  organizationId: string;
  organizationProtocolId: string;
  versionNumber: number;
  schemaDefinition: ProtocolSchema;
  formulaDefinition?: Record<string, string>;
  requirements?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  globalProtocol?: { name: string };
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

export interface GlobalProtocol {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

// Interfaz para la respuesta de adopción (lo que espera tu LibraryPage)
export interface AdoptResponse {
  id: string;
  organizationId: string;
  globalProtocolId: string;
  activeVersionId: string;
}

export function useProtocols() {
  const queryClient = useQueryClient();

  // 1. Obtener protocolos de la organización
  const {
    data: orgProtocolsResponse,
    isLoading: isLoadingOrg,
    error,
  } = useQuery({
    queryKey: ["admin", "protocols"],
    queryFn: async () => {
      const response = await api.get<{
        data: OrganizationProtocol[];
        meta: ApiPaginationMeta;
      }>("/org-protocols");
      return response.data;
    },
  });

  // 2. Obtener protocolos globales (Biblioteca)
  const { data: globalResponse, isLoading: isLoadingGlobals } = useQuery({
    queryKey: ["global-protocols"],
    queryFn: async () => {
      const response = await api.get<{
        data: GlobalProtocol[];
        meta: ApiPaginationMeta;
      }>("/global-protocols");
      return response.data;
    },
  });

  // 3. Obtener versión específica
  const useProtocolVersion = (versionId: string) => {
    return useQuery({
      queryKey: ["admin", "protocols", "version", versionId],
      queryFn: async () => {
        const cache = queryClient.getQueryData<{
          data: OrganizationProtocol[];
        }>(["admin", "protocols"]);

        const version = cache?.data
          .flatMap((p) => p.versions)
          .find((v) => v.id === versionId);

        if (version) return version;

        const { data } = await api.get<ProtocolVersion>(
          `/org-protocols/versions/${versionId}`,
        );
        return data;
      },
      enabled: !!versionId,
    });
  };

  // 4. Mutación: Adoptar Protocolo (CORREGIDO: Retorna .data)
  const adoptProtocol = useMutation({
    mutationFn: async (globalProtocolId: string) => {
      const response = await api.post<AdoptResponse>(
        `/org-protocols/adopt/${globalProtocolId}`,
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "protocols"] });
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error al adoptar");
    },
  });

  // 5. Mutación: Actualizar Esquema (Builder)
  const updateSchema = useMutation({
    mutationFn: async ({
      orgProtocolId,
      versionId,
      schema,
    }: {
      orgProtocolId: string;
      versionId: string;
      schema: ProtocolSchema;
    }) => {
      const response = await api.patch(
        `/org-protocols/${orgProtocolId}/versions/${versionId}`,
        { schemaDefinition: schema },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "protocols"] });
      toast.success("Diseño guardado correctamente");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error al guardar");
    },
  });

  // 6. Mutación: Crear Protocolo Global
  const createGlobalProtocol = useMutation({
    mutationFn: async (newProtocol: {
      name: string;
      code: string;
      category: string;
      description?: string;
    }) => {
      const response = await api.post("/global-protocols", newProtocol);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-protocols"] });
      toast.success("Norma técnica registrada en la biblioteca");
    },
    onError: () => {
      toast.error("Error al registrar la norma");
    },
  });

  // 7. Mutación: Toggle Status
  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch(`/org-protocols/${id}/active`, {
        isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "protocols"] });
    },
  });

  return {
    protocols: orgProtocolsResponse?.data || [],
    globalProtocols: globalResponse?.data || [],
    isLoading: isLoadingOrg || isLoadingGlobals,
    error,
    useProtocolVersion,
    adoptProtocol,
    updateSchema,
    toggleStatus,
    createGlobalProtocol,
  };
}
