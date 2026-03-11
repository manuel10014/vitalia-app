import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface WorkOrder {
  id: string;
  status:
    | "DRAFT"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "REVIEW_PENDING"
    | "APPROVED"
    | "REJECTED";
  scheduledDate: string;
  project: { name: string };
  technician: { fullName: string } | null;
}

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
