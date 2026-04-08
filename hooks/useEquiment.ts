import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { MeasurementEquipment, PaginatedResponse } from "@/types";
import { toast } from "sonner";

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

  return {
    ...query,
    equipment: query.data || [],
    createEquipment,
  };
}
