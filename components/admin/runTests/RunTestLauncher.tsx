"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Activity, ArrowRight, Loader2 } from "lucide-react";
import { useEquipment } from "@/hooks/useEquipment";
import { WorkOrder, Asset, WorkOrderService, ProtocolVersion } from "@/types";
import { toast } from "sonner";

export function RunTestLauncher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [workOrderId, setWorkOrderId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [protocolVersionId, setProtocolVersionId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");

  // --- Data Fetching ---
  const { data: workOrders, isLoading: ldWO } = useQuery<WorkOrder[]>({
    queryKey: ["work-orders", "launcher"],
    queryFn: async () => {
      const res = await api.get("/work-orders");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { data: assets } = useQuery<Asset[]>({
    queryKey: ["assets", "launcher"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { equipment } = useEquipment();

  // --- Mutación para crear el Test Run ---
  const createTestRun = useMutation({
    mutationFn: async () => {
      const payload = {
        workOrderId,
        assetId,
        protocolVersionId,
        equipmentIds: [equipmentId], // Enviamos el equipo seleccionado
        status: "IN_PROGRESS", //  Estado inicial solicitado
      };
      return await api.post("/test-runs", payload);
    },
    onSuccess: (res) => {
      const newTestRun = res.data;
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      toast.success("Ejecución técnica iniciada");

      // Redirige usando el ID de la ejecución recién creada
      router.push(`/admin/test-runs/execute/${newTestRun.id}`);
    },
    onError: () => {
      toast.error("No se pudo iniciar la ejecución técnica");
    },
  });

  const handleWorkOrderChange = (id: string) => {
    setWorkOrderId(id);
    const wo = workOrders?.find((o) => o.id === id);
    const planned = wo?.plannedServices || [];

    if (planned.length === 1) {
      const protocol = planned[0].organizationProtocol;
      const versionId =
        protocol.versions?.find((v: ProtocolVersion) => v.isActive)?.id ||
        protocol.versions?.[0]?.id;
      if (versionId) setProtocolVersionId(versionId);
    } else {
      setProtocolVersionId("");
    }
  };

  const isReady = workOrderId && assetId && protocolVersionId && equipmentId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2 font-bold shadow-lg transition-all active:scale-95">
          <Play size={16} fill="currentColor" /> Iniciar Prueba Técnica
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Activity className="text-green-600" /> Nueva Ejecución de Campo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. OT */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Orden de Trabajo (OT)
            </Label>
            <Select onValueChange={handleWorkOrderChange} value={workOrderId}>
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={ldWO ? "Cargando..." : "Seleccionar OT..."}
                />
              </SelectTrigger>
              <SelectContent>
                {workOrders?.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id} className="font-mono">
                    {wo.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Protocolo */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Servicio Planificado
            </Label>
            <Select
              onValueChange={setProtocolVersionId}
              value={protocolVersionId}
              disabled={!workOrderId}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar ensayo..." />
              </SelectTrigger>
              <SelectContent>
                {workOrders
                  ?.find((wo) => wo.id === workOrderId)
                  ?.plannedServices?.map((ps: WorkOrderService) => {
                    const protocol = ps.organizationProtocol;
                    const targetVersionId =
                      protocol?.versions?.find((v) => v.isActive)?.id ||
                      protocol?.versions?.[0]?.id;

                    if (!targetVersionId) return null;

                    return (
                      <SelectItem key={ps.id} value={targetVersionId}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {protocol?.globalProtocol?.name ||
                              "Protocolo sin nombre"}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            V{protocol?.versions?.[0]?.versionNumber || 1}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Activo */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Activo
            </Label>
            <Select onValueChange={setAssetId} value={assetId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar activo..." />
              </SelectTrigger>
              <SelectContent>
                {assets?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.tagId} - {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Equipo de Medición */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Equipo de Medición
            </Label>
            <Select onValueChange={setEquipmentId} value={equipmentId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccionar equipo..." />
              </SelectTrigger>
              <SelectContent>
                {equipment?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} (S/N: {e.serialNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!isReady || createTestRun.isPending}
            onClick={() => createTestRun.mutate()}
            className="w-full bg-green-600 hover:bg-green-700 h-12 font-black gap-2 mt-4 text-white"
          >
            {createTestRun.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                COMENZAR TOMA DE DATOS <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
