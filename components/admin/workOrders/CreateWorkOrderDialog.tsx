"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Project, User } from "@/types";
import { toast } from "sonner";

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Estados del formulario
  const [projectId, setProjectId] = useState("");
  const [assignedTechId, setAssignedTechId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  // Queries para llenar los selects
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });
  const { data: techs } = useQuery<User[]>({
    queryKey: ["technicians"],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: {
          role: "TECHNICIAN", // El QueryUsersDto debería mapear esto
          limit: 100, // Para traer todos los técnicos de una vez
        },
      });

      const rawData = response.data;
      return Array.isArray(rawData) ? rawData : rawData.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return await api.post("/work-orders", {
        projectId,
        assignedTechId,
        scheduledDate: new Date(scheduledDate).toISOString(),
        status: "ASSIGNED", // Al crearla con técnico, pasa a asignada
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success("Orden de Trabajo creada y asignada");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Error al crear la OT"),
  });

  const resetForm = () => {
    setProjectId("");
    setAssignedTechId("");
    setScheduledDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} /> Nueva OT
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select onValueChange={setProjectId} value={projectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(projects) && projects.length > 0 ? (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-xs text-center text-muted-foreground">
                    {projects === undefined
                      ? "Cargando proyectos..."
                      : "No hay proyectos disponibles"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Asignar Técnico</Label>
            <Select onValueChange={setAssignedTechId} value={assignedTechId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar técnico..." />
              </SelectTrigger>
              <SelectContent>
                {techs?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Programada</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <Button
            className="w-full mt-2"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !projectId || !assignedTechId}
          >
            {mutation.isPending ? "Guardando..." : "Confirmar Asignación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
