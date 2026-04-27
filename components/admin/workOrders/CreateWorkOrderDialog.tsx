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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  ClipboardList,
  MapPin,
  AlertCircle,
  Briefcase,
  Tag,
  Settings2,
  X,
  FileText,
} from "lucide-react";
import { ApiErrorResponse, OrganizationProtocol, Project, User } from "@/types";
import { toast } from "sonner";
import styles from "./CreateWorkOrder.module.css";
import { AxiosError } from "axios";

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // --- Estados del Formulario ---
  const [projectId, setProjectId] = useState("");
  const [assignedTechId, setAssignedTechId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [contractRef, setContractRef] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState(""); //  Nuevo
  const [code, setCode] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // --- Queries ---
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });

  const { data: techs } = useQuery<User[]>({
    queryKey: ["users-for-selection"],
    queryFn: async () => {
      const response = await api.get("/users", { params: { limit: 100 } });
      const rawData = response.data;
      return Array.isArray(rawData) ? rawData : rawData.data;
    },
  });

  const { data: availableServices } = useQuery<OrganizationProtocol[]>({
    queryKey: ["admin", "protocols"],
    queryFn: async () => {
      const response = await api.get("/org-protocols");
      return response.data.data;
    },
  });

  interface GeoLoc {
    lat?: number;
    lng?: number;
  }

  const handleProjectChange = (id: string) => {
    setProjectId(id);

    if (projects) {
      const selectedProject = projects.find((p) => p.id === id);

      // 1. Extraer dirección del cliente (Relación)
      if (selectedProject?.client?.address) {
        setAddress(selectedProject.client.address);
      }

      // 2. Extraer Lat/Lng del Json 'geoLocation' del Proyecto
      const geo = selectedProject?.geoLocation as GeoLoc;
      if (geo?.lat && geo?.lng) {
        // Podemos guardar esto en las observaciones o en el metadata de la OT
        const coordsString = `Ubicación GPS: ${geo.lat}, ${geo.lng}`;

        // Si el usuario no ha escrito nada en observaciones, lo ponemos ahí
        if (!observations) {
          setObservations((prev) =>
            prev ? `${prev}\n${coordsString}` : coordsString,
          );
        }

        toast.info(`Coordenadas cargadas: ${geo.lat}, ${geo.lng}`, {
          icon: <MapPin size={14} />,
        });
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        projectId,
        assignedTechId,
        scheduledDate: scheduledDate
          ? new Date(scheduledDate).toISOString()
          : null,
        priority,
        address,
        contractRef,
        observations,
        status: "ASSIGNED",
        code: code || `OT-${Date.now()}`,
        //  Como no hay serviceIds en el esquema, lo guardamos en metadata por ahora
        metadata: {
          plannedServices: selectedServices,
        },
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
      const message = error.response?.data?.message || "Error al crear la OT";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  const resetForm = () => {
    setProjectId("");
    setAssignedTechId("");
    setScheduledDate("");
    setPriority("MEDIA");
    setContractRef("");
    setAddress("");
    setObservations("");
    setCode("");
    setSelectedServices([]);
  };

  const toggleService = (id: string) => {
    if (!id) return;
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const isFormInvalid =
    !projectId || !assignedTechId || !code || selectedServices.length === 0;

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
            {/* Fila 1: Código y Referencia */}
            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Código de Orden *</Label>
                <div className={styles.inputIconWrapper}>
                  <Tag className={styles.inputIcon} size={16} />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: OT-2024-001"
                    className={styles.inputWithIcon}
                  />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>
                  Ref. Contrato / Cotización
                </Label>
                <div className={styles.inputIconWrapper}>
                  <Briefcase className={styles.inputIcon} size={16} />
                  <Input
                    value={contractRef}
                    onChange={(e) => setContractRef(e.target.value)}
                    placeholder="Opcional"
                    className={styles.inputWithIcon}
                  />
                </div>
              </div>
            </div>

            {/* Selección de Proyecto */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>Proyecto del Cliente *</Label>
              <Select onValueChange={handleProjectChange} value={projectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto..." />
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

            {/*  SECCIÓN DE SERVICIOS (Igual que antes) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Label className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                <Settings2 size={16} className="text-blue-600" />
                Servicios a Realizar *
              </Label>
              <Select onValueChange={toggleService}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Agregar servicio técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {availableServices?.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      disabled={selectedServices.includes(s.id)}
                    >
                      {s.globalProtocol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedServices.map((id) => {
                  const s = availableServices?.find((x) => x.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="pl-3 pr-1 py-1 gap-1 bg-white border-blue-200"
                    >
                      {s?.globalProtocol.name}
                      <X
                        size={14}
                        className="cursor-pointer text-red-500"
                        onClick={() => toggleService(id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/*  NUEVO: Observaciones Previas (Aprovechando el esquema) */}
            <div className={styles.fieldGroup}>
              <Label className={styles.label}>
                Observaciones Logísticas / Riesgos
              </Label>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-3 text-slate-400"
                  size={16}
                />
                <Textarea
                  placeholder="Ej: Requiere andamios, zona con ruido extremo, etc."
                  className="pl-10 min-h-[80px] bg-amber-50/30 border-amber-100"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
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
                    <SelectValue placeholder="Asignar..." />
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

            {/* Fecha y Dirección */}
            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Fecha Ejecución</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label className={styles.label}>Dirección del Sitio</Label>
                <div className={styles.inputIconWrapper}>
                  <MapPin className={styles.inputIcon} size={16} />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Se hereda del proyecto"
                    className={styles.inputWithIcon}
                  />
                </div>
              </div>
            </div>

            {isFormInvalid && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                <AlertCircle size={14} />
                Complete los campos marcados con (*) y seleccione servicios.
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
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "CREAR ORDEN DE TRABAJO"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
