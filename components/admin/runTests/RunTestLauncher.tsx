"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { Play, Activity, ArrowRight } from "lucide-react";
import { WorkOrder, Asset } from "@/types";
import { OrganizationProtocol } from "@/hooks/useProtocols";

export function RunTestLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [workOrderId, setWorkOrderId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [protocolVersionId, setProtocolVersionId] = useState("");

  // Queries unificadas y seguras
  const { data: workOrders, isLoading: ldWO } = useQuery<WorkOrder[]>({
    queryKey: ["work-orders", "launcher"],
    queryFn: async () => {
      const res = await api.get("/work-orders");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { data: assets, isLoading: ldAssets } = useQuery<Asset[]>({
    queryKey: ["assets", "launcher"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });
  const { data: services, isLoading } = useQuery<OrganizationProtocol[]>({
    queryKey: ["org-protocols-list"],
    queryFn: async () => {
      // Usamos la ruta base que definiste en el Controller: @Get()
      const res = await api.get("/org-protocols");
      // Manejamos si la respuesta viene envuelta en { data: [] }
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });
  const handleStart = () => {
    const params = new URLSearchParams({
      workOrderId,
      assetId,
      protocolVersionId,
    });
    router.push(`/admin/run-tests/execute?${params.toString()}`);
  };

  const isReady = workOrderId && assetId && protocolVersionId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2 font-bold shadow-lg">
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
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">
              Orden de Trabajo (OT)
            </Label>
            <Select onValueChange={setWorkOrderId} value={workOrderId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={ldWO ? "Cargando..." : "Seleccionar OT..."}
                />
              </SelectTrigger>
              <SelectContent>
                {workOrders?.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id}>
                    {wo.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">
              Activo
            </Label>
            <Select onValueChange={setAssetId} value={assetId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    ldAssets ? "Cargando..." : "Seleccionar activo..."
                  }
                />
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

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">
              Protocolo
            </Label>
            <Select
              onValueChange={setProtocolVersionId}
              value={protocolVersionId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Cargando servicios..."
                      : "Seleccionar servicio..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {services?.map((service) => {
                  // Intentamos buscar una versión, pero si no hay, no bloqueamos el render
                  const targetVersion =
                    service.versions?.find((v) => v.isActive) ||
                    service.versions?.[0];

                  // El valor del Select será el ID de la versión si existe,
                  // de lo contrario usamos el ID del servicio (aunque la captura fallará luego sin campos)
                  const selectionValue = targetVersion?.id || service.id;

                  return (
                    <SelectItem key={service.id} value={selectionValue}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {service.globalProtocol.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {targetVersion
                            ? `Versión disponible: v${targetVersion.versionNumber}`
                            : "Sin versión configurada"}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!isReady}
            onClick={handleStart}
            className="w-full bg-green-600 hover:bg-green-700 h-12 font-black gap-2"
          >
            CONTINUAR A CAPTURA <ArrowRight size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
