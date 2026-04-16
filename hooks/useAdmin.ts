import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Client,
  Project,
  Asset,
  PaginatedResponse,
  ApiErrorResponse,
} from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useClients(page = 1) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: ["admin", "clients", { page }],
    queryFn: async () => {
      const { data } = await api.get(`/clients`, { params: { page } });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProjects(clientId?: string) {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ["admin", "projects", { clientId }],
    queryFn: async () => {
      const { data } = await api.get("/projects", { params: { clientId } });
      return data;
    },
    enabled: true,
  });
}

export function useAssets(projectId?: string) {
  return useQuery<PaginatedResponse<Asset>>({
    queryKey: ["admin", "assets", { projectId }],
    queryFn: async () => {
      const { data } = await api.get("/assets", {
        params: { projectId },
      });
      return data;
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newAsset: Partial<Asset>) => api.post("/assets", newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
      toast.success("Activo técnico registrado correctamente");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message || "Error al crear el activo";

      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
}
