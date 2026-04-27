import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { WorkOrder } from "@/types";

export function useWorkOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "work-orders"],
    queryFn: async () => {
      const { data } = await api.get<{ data: WorkOrder[] }>("/work-orders");
      return data.data;
    },
  });

  return {
    workOrders: data || [],
    isLoading,
  };
}
