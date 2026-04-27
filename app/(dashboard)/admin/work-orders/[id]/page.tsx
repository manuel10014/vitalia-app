"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: wo, isLoading } = useQuery({
    queryKey: ["work-orders", id],
    queryFn: async () => {
      const res = await api.get(`/work-orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-black uppercase italic text-slate-800">
          Detalle de Orden: {wo?.code}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase">
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Proyecto:</span>
              <span className="font-bold">{wo?.project?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Estado:</span>
              <span className="badge bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                {wo?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha Programada:</span>
              <span className="font-bold">
                {new Date(wo?.scheduledDate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Técnico Asignado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase">
              Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <div className="bg-slate-100 p-3 rounded-full">
              <User className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">
                Técnico Asignado
              </p>
              <p className="font-bold text-slate-700">
                {wo?.technician?.fullName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
