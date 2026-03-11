import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Definimos la interfaz basada en el esquema de Prisma
export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
}

// Reutilizamos la interfaz de error que definimos anteriormente
interface ApiErrorResponse {
  message: string | string[];
}

export function useCategoryAdmin() {
  const queryClient = useQueryClient();

  // Consulta de categorías
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "asset-categories"],
    queryFn: async () => {
      const res = await api.get<AssetCategory[]>("/asset-categories");

      return Array.isArray(res.data) ? res.data : [];
    },
    initialData: [],
  });

  // Mutación para crear
  const createCategory = useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      return await api.post("/asset-categories", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "asset-categories"],
      });
      toast.success("Categoría creada con éxito");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error al crear");
    },
  });

  return {
    data,
    isLoading,
    createCategory,
  };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      return await api.post("/asset-categories", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "asset-categories"],
      });
      toast.success("Categoría creada con éxito");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Error al crear");
    },
  });
}
