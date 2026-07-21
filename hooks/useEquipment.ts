import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ApiErrorResponse,
  MeasurementEquipment,
  PaginatedResponse,
} from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useEquipment() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "equipment"],
    queryFn: async () => {
      const { data } =
        await api.get<PaginatedResponse<MeasurementEquipment>>("/equipment");
      return data.data;
    },
  });

  const createEquipment = useMutation({
    mutationFn: async (
      newEquipment: FormData | Partial<MeasurementEquipment>,
    ) => {
      return await api.post("/equipment", newEquipment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] });
      toast.success("Equipo registrado correctamente");
    },
    onError: () => toast.error("Error al registrar equipo"),
  });

  const updateEquipment = useMutation({
    // Recibe un objeto con el ID y los datos (FormData)
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.patch(`/equipment/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Debe coincidir con la queryKey real de la lista (["admin",
      // "equipment"]) — con solo ["equipment"] no invalidaba nada y la
      // tabla se quedaba con los datos viejos tras editar.
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message || "Error al actualizar el equipo";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  return {
    ...query,
    equipment: query.data || [],
    createEquipment,
    updateEquipment,
  };
}
