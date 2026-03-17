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
import { Play } from "lucide-react";
import { Asset, Protocol } from "@/types";
import { ProtocolField } from "@/hooks/useProtocols";

export function RunTestDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const { data: assets } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => (await api.get<Asset[]>("/assets")).data,
  });

  // ✅ Corregido el tipo de Pro[] a Protocol[]
  const { data: protocols } = useQuery<Protocol[]>({
    queryKey: ["protocols"],
    queryFn: async () => (await api.get<Protocol[]>("/protocols")).data,
  });

  const activeProtocol = protocols?.find((p) => p.id === selectedProtocolId);
  const protocolFields = (activeProtocol?.fields || []) as ProtocolField[];

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        assetId: selectedAssetId,
        protocolId: selectedProtocolId,
        values: answers,
      };
      // ⚠️ Nota: Asegúrate que el endpoint en el backend sea el correcto
      // (usualmente es /test-runs para crear ejecuciones)
      return await api.post("/reports", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      setAnswers({});
      setSelectedAssetId("");
      setSelectedProtocolId("");
    },
    onError: () => alert("Error al guardar el reporte"),
  });

  const handleInputChange = (fieldLabel: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Play className="mr-2 h-4 w-4" /> Ejecutar Prueba
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Reporte Técnico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activo</Label>
              <Select
                onValueChange={setSelectedAssetId}
                value={selectedAssetId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {assets?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.tagId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Protocolo</Label>
              <Select
                onValueChange={setSelectedProtocolId}
                value={selectedProtocolId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {protocols?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t my-2"></div>

          {activeProtocol ? (
            <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
              {protocolFields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label className="text-right col-span-1">{field.label}</Label>
                  {field.type === "text" && (
                    <Input
                      className="col-span-3"
                      onChange={(e) =>
                        handleInputChange(field.label, e.target.value)
                      }
                    />
                  )}
                  {field.type === "number" && (
                    <Input
                      type="number"
                      className="col-span-3"
                      onChange={(e) =>
                        handleInputChange(field.label, Number(e.target.value))
                      }
                    />
                  )}
                  {field.type === "check" && (
                    <Select
                      onValueChange={(val) =>
                        handleInputChange(field.label, val)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASS">PASA</SelectItem>
                        <SelectItem value="FAIL">FALLA</SelectItem>
                        <SelectItem value="NA">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              Selecciona un protocolo.
            </div>
          )}

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full mt-4"
          >
            {mutation.isPending ? "Guardando..." : "Guardar Reporte"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
