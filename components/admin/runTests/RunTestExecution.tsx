"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ApiErrorResponse,
  MeasurementEquipment,
  OrganizationProtocolVersion,
} from "@/types";
import { useDynamicForm } from "@/hooks/useDynamicForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Wrench,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { AxiosError } from "axios";
import { RunTestForm } from "./RunTestForm";

export function RunTestExecution() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const workOrderId = searchParams.get("workOrderId") || "";
  const assetId = searchParams.get("assetId") || "";
  const protocolVersionId = searchParams.get("protocolVersionId") || "";

  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    [],
  );

  // 1. Cargar la versión del servicio
  const {
    data: protocolVersion,
    isLoading: ldProto,
    error: protoError,
  } = useQuery<OrganizationProtocolVersion>({
    queryKey: ["protocol-version", protocolVersionId],
    queryFn: async () => {
      const res = await api.get(`/org-protocols/versions/${protocolVersionId}`);
      return res.data;
    },
    enabled: !!protocolVersionId,
    retry: 1,
  });

  // 2. Cargar equipos de medición
  const { data: equipments } = useQuery<MeasurementEquipment[]>({
    queryKey: ["equipments", "active"],
    queryFn: async () => {
      const res = await api.get("/equipments");
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  // 3. Hook de formulario dinámico
  const { formData, handleInputChange } = useDynamicForm(
    protocolVersion?.schemaDefinition || {
      protocol_name: "",
      version: "",
      sections: [],
    },
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        workOrderId,
        assetId,
        protocolVersionId,
        capturedData: formData,
        equipmentIds: selectedEquipmentIds,
        status: "SUBMITTED",
      };
      return await api.post("/test-runs", payload);
    },
    onSuccess: () => {
      toast.success("Servicio finalizado y guardado");
      router.push("/admin/test-runs");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(err.response?.data?.message || "Error al guardar");
    },
  });

  if (ldProto)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Cargando Formulario...
        </p>
      </div>
    );

  // Pantalla de error si no hay versión válida cargada
  if (protoError || !protocolVersion)
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-slate-800 uppercase">
            Servicio no configurado
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            El servicio seleccionado no tiene una versión de formulario válida o
            activa. Por favor, configure el diseño técnico en la biblioteca
            antes de ejecutar.
          </p>
          <Button
            className="mt-6 w-full font-bold"
            onClick={() => router.back()}
          >
            Volver al Selector
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden">
      {/* HEADER TÉCNICO */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-400 uppercase leading-none tracking-tighter">
              Ejecución de Campo
            </h1>
            <span className="text-xl font-black text-slate-800 leading-tight">
              {protocolVersion.organizationProtocol?.globalProtocol?.name ||
                "Servicio Técnico"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-6 shadow-lg shadow-green-100"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Save className="mr-2" size={18} />
            )}
            FINALIZAR Y ENVIAR
          </Button>
        </div>
      </header>

      {/* CUERPO DEL SERVICIO */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6 pb-20">
          {/* Tarjeta de Contexto (OT + Activo) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Orden de Trabajo
              </span>
              <span className="font-bold text-slate-700">
                OT: {workOrderId.split("-")[0].toUpperCase()}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Activo Inspeccionado
              </span>
              <span className="font-bold text-slate-700 italic">
                Cargando datos del activo...
              </span>
            </div>
          </div>

          {/* Selección de Equipos */}
          <Card className="border-blue-100 bg-blue-50/30 overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <Label className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase">
                <Wrench size={16} /> Instrumentos de Medición
              </Label>
              <MultiSelect
                placeholder="Vincular herramientas calibradas..."
                options={
                  equipments?.map((e) => ({
                    label: `${e.name} (${e.serialNumber || "S/N"})`,
                    value: e.id,
                  })) || []
                }
                selected={selectedEquipmentIds}
                onChange={setSelectedEquipmentIds}
              />
            </CardContent>
          </Card>

          {/* Formulario Dinámico de Captura */}
          <RunTestForm
            protocolVersion={protocolVersion}
            handleInputChange={handleInputChange}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
