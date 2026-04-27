"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Asegúrate de importar el Input de UI
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
import {
  Play,
  Loader2,
  ClipboardCheck,
  Activity,
  Hash,
  Type,
} from "lucide-react";
import {
  Asset,
  WorkOrder,
  OrganizationProtocolVersion,
  CapturedDataRecord,
  CapturedValue,
} from "@/types";
import { toast } from "sonner";

export function RunTestDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [workOrderId, setWorkOrderId] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  const [protocolVersionId, setProtocolVersionId] = useState<string>("");
  const [capturedData, setCapturedData] = useState<CapturedDataRecord>({});

  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ["work-orders", "available-test"],
    queryFn: async () => {
      const res = await api.get("/work-orders");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      return data.filter(
        (wo: WorkOrder) =>
          wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS",
      );
    },
  });

  const { data: assets } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { data: protocols } = useQuery<OrganizationProtocolVersion[]>({
    queryKey: ["org-protocols-versions"],
    queryFn: async () => {
      const res = await api.get("/organization-protocols/versions/active");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const activeVersion = protocols?.find((v) => v.id === protocolVersionId);
  const sections = activeVersion?.schemaDefinition.sections || [];

  // Función para normalizar el valor y evitar errores de TS en el Input
  const getValidValue = (val: CapturedValue): string | number => {
    if (typeof val === "string" || typeof val === "number") return val;
    return ""; // Si es File, boolean o undefined
  };

  const handleInputChange = (fieldId: string, value: CapturedValue) => {
    setCapturedData((prev) => ({ ...prev, [fieldId]: value }));
  };

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
      toast.success("Ejecución enviada");
      setOpen(false);
      setCapturedData({});
    },
    onError: () => {
      toast.error("Error al guardar");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 font-bold">
          <Play size={16} className="mr-2" /> Ejecutar Prueba
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[750px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b bg-white z-50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black">
            <Activity className="text-green-600" /> Nueva Ejecución
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8 pointer-events-auto">
            {/* Contexto - SELECTS */}
            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border shadow-sm relative z-10">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                  OT
                </Label>
                <Select onValueChange={setWorkOrderId} value={workOrderId}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Seleccionar OT" />
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
                <Label className="text-xs font-bold uppercase text-slate-400">
                  Activo
                </Label>
                <Select onValueChange={setAssetId} value={assetId}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Seleccionar Activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.tagId || "S/N"} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                  Protocolo
                </Label>
                <Select
                  onValueChange={setProtocolVersionId}
                  value={protocolVersionId}
                >
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Seleccionar Protocolo" />
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

            {/* CAMPOS DINÁMICOS */}
            <div className="space-y-4 relative z-10">
              <h3 className="text-xs font-black uppercase text-slate-500 px-1 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-green-600" /> Datos de
                Ensayo
              </h3>

              {activeVersion ? (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className="bg-slate-50 px-5 py-3 border-b">
                        <span className="text-[10px] font-black uppercase text-slate-600">
                          {section.title}
                        </span>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.fields.map((field) => (
                          <div key={field.id} className="space-y-2 text-left">
                            <Label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                              {field.type === "number" ? (
                                <Hash size={12} />
                              ) : (
                                <Type size={12} />
                              )}
                              {field.label} {field.required && "*"}
                            </Label>
                            <div className="relative">
                              <Input
                                className="h-11 border-slate-200 focus:ring-2 focus:ring-green-500 relative z-20 pointer-events-auto"
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                placeholder={field.label}
                                // ✅ CORRECCIÓN DE TIPO: Usamos getValidValue para limpiar el estado
                                value={getValidValue(capturedData[field.id])}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleInputChange(
                                    field.id,
                                    field.type === "number"
                                      ? val === ""
                                        ? ""
                                        : Number(val)
                                      : val,
                                  );
                                }}
                              />
                              {field.unit && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                                  {field.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed rounded-2xl text-slate-400">
                  Seleccione un protocolo...
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white z-50">
          <Button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !workOrderId ||
              !assetId ||
              !protocolVersionId
            }
            className="w-full bg-green-600 h-14 font-black uppercase tracking-widest shadow-xl"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin mr-3" />
            ) : (
              "FINALIZAR EJECUCIÓN"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
