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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Loader2,
  ClipboardList,
  MapPin,
  Calendar,
  AlertCircle,
  Briefcase,
  Tag,
} from "lucide-react";
import { ApiErrorResponse, Project, User } from "@/types";
import { toast } from "sonner";
import styles from "./CreateWorkOrder.module.css";
import { AxiosError } from "axios";

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Estados del formulario (Sincronizados con el modelo WorkOrder de Prisma)
  const [projectId, setProjectId] = useState("");
  const [assignedTechId, setAssignedTechId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [contractRef, setContractRef] = useState("");
  const [address, setAddress] = useState("");

  // Nota: Si el backend no genera el 'code' automáticamente, necesitamos pedirlo o generarlo
  const [code, setCode] = useState("");

  // Query de Proyectos
  const { data: projects, isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });

  // Query de Usuarios (Cargamos todos para seleccionar técnico)
  const { data: techs, isLoading: loadingTechs } = useQuery<User[]>({
    queryKey: ["users-for-selection"],
    queryFn: async () => {
      const response = await api.get("/users", { params: { limit: 100 } });
      const rawData = response.data;
      return Array.isArray(rawData) ? rawData : rawData.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Objeto final para el POST
      const payload = {
        projectId,
        assignedTechId,
        // En Prisma es scheduled_date (DateTime?)
        scheduledDate: scheduledDate
          ? new Date(scheduledDate).toISOString()
          : null,
        description,
        priority, // "BAJA", "MEDIA", "ALTA", "URGENTE"
        address,
        contractRef, // mapeado a contract_ref
        status: "ASSIGNED",
        code: code || `OT-${Date.now()}`, // Requerido por el @unique de Prisma
      };

      return await api.post("/work-orders", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success("Orden de Trabajo creada exitosamente");
      setOpen(false);
      resetForm();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ||
        "Error 400: Verifique los campos obligatorios";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  const resetForm = () => {
    setProjectId("");
    setAssignedTechId("");
    setScheduledDate("");
    setDescription("");
    setPriority("MEDIA");
    setContractRef("");
    setAddress("");
    setCode("");
  };

  const isFormInvalid = !projectId || !assignedTechId || !description;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
          <Plus size={16} /> Nueva OT
        </Button>
      </DialogTrigger>

      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.header}>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardList className="text-blue-600" size={24} />
            </div>
            Nueva Orden de Trabajo
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className={styles.scrollArea}>
          <div className={styles.formContainer}>
            {/* Código de la OT (Requerido por @unique en Prisma) */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Código de Orden *</Label>
              <div className={styles.inputIconWrapper}>
                <Tag className={styles.inputIcon} size={16} />
                <Input
                  placeholder="Ej: OT-2024-001"
                  className={styles.inputWithIcon}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            {/* Selección de Proyecto */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Proyecto *</Label>
              <Select onValueChange={setProjectId} value={projectId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingProjects
                        ? "Cargando..."
                        : "Seleccionar proyecto..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Descripción del Trabajo *</Label>
              <Textarea
                placeholder="Actividades a realizar..."
                className="min-h-[100px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Técnico y Prioridad */}
            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Técnico Líder *</Label>
                <Select
                  onValueChange={setAssignedTechId}
                  value={assignedTechId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingTechs ? "Cargando..." : "Asignar..."}
                    />
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

              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Prioridad</Label>
                <Select onValueChange={setPriority} value={priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAJA">Baja</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fecha y Referencia */}
            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Fecha Programada</Label>
                <div className={styles.inputIconWrapper}>
                  <Calendar className={styles.inputIcon} size={16} />
                  <Input
                    type="date"
                    className={styles.inputWithIcon}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Ref. Contrato</Label>
                <div className={styles.inputIconWrapper}>
                  <Briefcase className={styles.inputIcon} size={16} />
                  <Input
                    placeholder="Contrato/Cotización"
                    className={styles.inputWithIcon}
                    value={contractRef}
                    onChange={(e) => setContractRef(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Dirección del Sitio</Label>
              <div className={styles.inputIconWrapper}>
                <MapPin className={styles.inputIcon} size={16} />
                <Input
                  placeholder="Lugar de intervención..."
                  className={styles.inputWithIcon}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {isFormInvalid && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                <AlertCircle size={14} />
                Complete Código, Proyecto, Técnico y Descripción.
              </div>
            )}
          </div>
        </ScrollArea>

        <div className={styles.footer}>
          <Button
            className={styles.submitBtn}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || isFormInvalid}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                CREANDO...
              </>
            ) : (
              "CONFIRMAR ORDEN DE TRABAJO"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
