import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse, ApiPaginationMeta } from "@/types";

export interface ProtocolField {
  id: string;
  label: string;
  type: "text" | "number" | "select";
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

export function useProtocols() {
  const queryClient = useQueryClient();

  const {
    data: orgProtocolsResponse,
    isLoading: isLoadingOrg,
    error,
  } = useQuery({
    queryKey: ["admin", "protocols"],
    queryFn: async () => {
      const { data } = await api.get<{
        data: OrganizationProtocol[];
        meta: ApiPaginationMeta;
      }>("/org-protocols");
      return data;
    },
  });

  const { data: globalResponse, isLoading: isLoadingGlobals } = useQuery({
    queryKey: ["global-protocols"],
    queryFn: async () => {
      const { data } = await api.get<{
        data: GlobalProtocol[];
        meta: ApiPaginationMeta;
      }>("/global-protocols");
      return data;
    },
  });

  // 3. Obtener versión específica (Busca en cache primero, si no, pide al servidor)
  const useProtocolVersion = (versionId: string) => {
    return useQuery({
      queryKey: ["admin", "protocols", "version", versionId],
      queryFn: async () => {
        // Intentar recuperar de la lista ya cargada para ahorrar tráfico
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

  // 4. Mutación: Adoptar Protocolo de la biblioteca
  const adoptProtocol = useMutation({
    mutationFn: async (globalProtocolId: string) => {
      return await api.post(`/org-protocols/adopt/${globalProtocolId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "protocols"] });
      toast.success("Protocolo adoptado con éxito");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error al adoptar");
    },
  });

  // 5. Mutación: Actualizar Esquema (Guardar diseño del Builder)
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
      return await api.patch(
        `/org-protocols/${orgProtocolId}/versions/${versionId}`,
        { schemaDefinition: schema },
      );
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

  const createGlobalProtocol = useMutation({
    mutationFn: async (newProtocol: {
      name: string;
      code: string;
      category: string;
      description?: string;
    }) => {
      return await api.post("/global-protocols", newProtocol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-protocols"] });
      toast.success("Norma técnica registrada en la biblioteca");
    },
    onError: () => {
      toast.error("Error al registrar la norma");
    },
  });

  // 6. Mutación: Cambiar estado Activo/Inactivo
  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await api.patch(`/org-protocols/${id}/active`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "protocols"] });
    },
  });

  return {
    // Retornamos arrays limpios para los componentes
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
