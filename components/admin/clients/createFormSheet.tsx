"use client";

import { useEffect } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  Contact,
  ShieldCheck,
  User,
  MapPin,
} from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import { ClientFormData, clientSchema } from "./schema";
import { Client } from "@/types";
import styles from "./clientsFormSheet.module.css";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Listado de ciudades principales de Colombia
const COLOMBIAN_CITIES = [
  "Bogotá, D.C.",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Santamarta",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Cúcuta",
  "Ibagué",
  "Villavicencio",
  "Montería",
  "Pastos",
  "Neiva",
];

interface ClientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormSheet({
  open,
  onOpenChange,
  client,
}: ClientFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      businessName: "",
      taxId: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      isActive: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          businessName: client.businessName,
          taxId: client.taxId || "",
          contactName: client.contactName || "",
          email: client.email || "",
          phone: client.phone || "",
          address: client.address || "",
          city: client.city || "",
          isActive: client.isActive,
        });
      } else {
        reset({
          businessName: "",
          taxId: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          isActive: true,
        });
      }
    }
  }, [client, reset, open]);

  const mutation = useMutation({
    mutationFn: async (values: ClientFormData) => {
      return isEditing
        ? await api.patch(`/clients/${client?.id}`, values)
        : await api.post("/clients", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "clients"],
      });

      toast.success(isEditing ? "Cliente actualizado" : "Cliente registrado");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Error inesperado";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const onSubmit = (data: ClientFormData) => {
    mutation.mutate(data);
  };

  const onInvalid = (err: FieldErrors<ClientFormData>) => {
    console.log("Validation Errors:", err);
    toast.error("Por favor, revisa los campos obligatorios en rojo.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles.sheetContent} side="right">
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <Building2 className={styles.titleIcon} size={24} />
            {isEditing ? "Editar Cliente" : "Registro de Cliente"}
          </SheetTitle>
          <SheetDescription>
            Información técnica y legal para la gestión de activos.
          </SheetDescription>
        </SheetHeader>

        <div className={styles.scrollArea}>
          <form
            id="client-form"
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className={styles.form}
          >
            {/* Sección Legal */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <ShieldCheck size={16} />
                <span className={styles.sectionLabel}>
                  Identificación Legal
                </span>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <Label>Razón Social *</Label>
                  <Input
                    {...register("businessName")}
                    className={errors.businessName ? styles.inputError : ""}
                    placeholder="Ej: Vitalia Energy S.A.S"
                  />
                  {errors.businessName && (
                    <p className={styles.errorText}>
                      {errors.businessName.message}
                    </p>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <Label>NIT / Tax ID *</Label>
                  <Input
                    {...register("taxId")}
                    className={errors.taxId ? styles.inputError : ""}
                    placeholder="900.000.000-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección Ubicación con SELECT */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MapPin size={16} />
                <span className={styles.sectionLabel}>Ubicación</span>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <Label>Dirección *</Label>
                  <Input
                    {...register("address")}
                    className={errors.address ? styles.inputError : ""}
                    placeholder="Calle 100 # 15-20"
                  />
                  {errors.address && (
                    <p className={styles.errorText}>{errors.address.message}</p>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Ciudad *</Label>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={errors.city ? styles.inputError : ""}
                        >
                          <SelectValue placeholder="Seleccionar ciudad..." />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOMBIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && (
                    <p className={styles.errorText}>{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección Contacto */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Contact size={16} />
                <span className={styles.sectionLabel}>Contacto Directo</span>
              </div>
              <div className={styles.fieldGrid}>
                <div
                  className={styles.fieldGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Label>Persona de contacto *</Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      {...register("contactName")}
                      className={`pl-10 ${errors.contactName ? styles.inputError : ""}`}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Email *</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    className={errors.email ? styles.inputError : ""}
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Teléfono *</Label>
                  <Input
                    {...register("phone")}
                    className={errors.phone ? styles.inputError : ""}
                    placeholder="+57 300..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.configBox}>
              <div className={styles.configInfo}>
                <Label className={styles.configTitle}>Estado</Label>
                <p className={styles.configSub}>Cuenta activa</p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </form>
        </div>

        <SheetFooter className={styles.footer}>
          <Button
            form="client-form"
            type="submit"
            className="w-full h-12"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "GUARDAR CAMBIOS"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
