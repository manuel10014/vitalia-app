"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Loader2, ClipboardCheck, Activity } from "lucide-react";
import {
  Asset,
  WorkOrder,
  OrganizationProtocolVersion,
  ProtocolField,
  CapturedDataRecord,
  ApiErrorResponse,
} from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function RunTestDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Estados del formulario
  const [workOrderId, setWorkOrderId] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  const [protocolVersionId, setProtocolVersionId] = useState<string>("");
  const [capturedData, setCapturedData] = useState<CapturedDataRecord>({});

  // 1. Obtener OTs activas
  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ["work-orders", "available-for-test"], // Cambia la key para refrescar cache
    queryFn: async () => {
      // Probamos quitando el filtro o incluyendo ASSIGNED e IN_PROGRESS
      const response = await api.get("/work-orders");
      const rawData = response.data;
      const allOrders = Array.isArray(rawData) ? rawData : rawData.data;

      // Filtramos en el frontend para mayor seguridad si es necesario
      return allOrders.filter(
        (wo: WorkOrder) =>
          wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS",
      );
    },
  });

  // 2. Obtener Activos
  const { data: assets } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  // 3. Obtener Protocolos
  const { data: protocols } = useQuery<OrganizationProtocolVersion[]>({
    queryKey: ["org-protocols-versions"],
    queryFn: async () => {
      const res = await api.get("/organization-protocols/versions/active");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  // Lógica de campos dinámicos
  const activeVersion = protocols?.find((v) => v.id === protocolVersionId);
  const protocolFields: ProtocolField[] =
    activeVersion?.schemaDefinition.sections.flatMap((s) => s.fields) || [];

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        workOrderId,
        assetId,
        protocolVersionId,
        capturedData,
        status: "SUBMITTED",
      };
      return await api.post("/test-runs", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      toast.success("Ejecución de prueba registrada");
      setOpen(false);
      resetForm();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message =
        err.response?.data?.message || "Error al guardar ejecución";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  const resetForm = () => {
    setWorkOrderId("");
    setAssetId("");
    setProtocolVersionId("");
    setCapturedData({});
  };

  const handleInputChange = (
    fieldKey: string,
    value: string | number | boolean,
  ) => {
    setCapturedData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2 font-bold shadow-lg shadow-green-100">
          <Play size={16} fill="currentColor" /> Ejecutar Prueba Técnica
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0 bg-white">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
            Nueva Ejecución de Campo
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 bg-slate-50/30">
          <div className="space-y-6">
            {/* Vinculación de Identidad */}
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Orden de Trabajo (OT)
                </Label>
                <Select onValueChange={setWorkOrderId} value={workOrderId}>
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Seleccionar OT..." />
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
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Activo
                </Label>
                <Select onValueChange={setAssetId} value={assetId}>
                  <SelectTrigger className="bg-slate-50 border-none">
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

              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Protocolo
                </Label>
                <Select
                  onValueChange={setProtocolVersionId}
                  value={protocolVersionId}
                >
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Seleccionar protocolo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {protocols?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.organizationProtocol.globalProtocol.name} (v
                        {v.versionNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Formulario Dinámico */}
            <div className="space-y-4">
              <h3 className="text-sm font-black flex items-center gap-2 text-slate-700 uppercase tracking-tight">
                <ClipboardCheck size={18} className="text-green-600" /> Datos de
                Captura
              </h3>

              {activeVersion ? (
                <div className="grid gap-4 p-5 bg-white rounded-xl border border-green-100 shadow-sm">
                  {protocolFields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        {field.label} {field.required && "*"}
                      </Label>
                      {field.type === "number" ? (
                        <Input
                          type="number"
                          placeholder="0.00"
                          step={field.step}
                          onChange={(e) =>
                            handleInputChange(
                              field.name,
                              Number(e.target.value),
                            )
                          }
                          className="focus-visible:ring-green-500"
                        />
                      ) : field.type === "select" ? (
                        <Select
                          onValueChange={(val) =>
                            handleInputChange(field.name, val)
                          }
                        >
                          <SelectTrigger className="focus:ring-green-500">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Ingrese valor..."
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          className="focus-visible:ring-green-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-slate-400 italic">
                  Seleccione un protocolo para cargar los campos de prueba.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white shrink-0">
          <Button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !workOrderId ||
              !assetId ||
              !protocolVersionId
            }
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-md font-black shadow-lg"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              "FINALIZAR Y ENVIAR EJECUCIÓN"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
