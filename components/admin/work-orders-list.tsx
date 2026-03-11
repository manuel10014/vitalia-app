'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin } from "lucide-react";
import { WorkOrder } from '@/types'; 

export function WorkOrdersList() {

  const { data: orders } = useQuery<WorkOrder[]>({ 
    queryKey: ['work-orders'], 
    queryFn: async () => (await api.get<WorkOrder[]>('/work-orders')).data 
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'DRAFT': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders?.map((order) => (
        <Card key={order.id} className="p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="font-bold text-lg">WO-{order.id.split('-')[0]}</div>
            <Badge className={`${getStatusColor(order.status)} text-white`}>
              {order.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{order.project?.name || 'Sin Proyecto'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{order.technician?.fullName || 'Sin Asignar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      ))}
      {orders?.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-10">
          No hay órdenes de trabajo activas.
        </div>
      )}
    </div>
  );
}