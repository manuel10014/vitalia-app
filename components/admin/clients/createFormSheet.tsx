"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Building2, Contact, ShieldCheck, User } from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import { clientSchema, type ClientFormValues } from "./schema";
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

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      businessName: "",
      taxId: "",
      contactName: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  // Efecto para cargar datos cuando se abre el modo edición
  useEffect(() => {
    if (open) {
      if (client) {
        const contact = client.contactInfo || {};
        form.reset({
          businessName: client.businessName,
          taxId: client.taxId || "",
          contactName: contact.name ?? "",
          email: contact.email ?? "",
          phone: contact.phone ? String(contact.phone) : "",
          isActive: client.isActive,
        });
      } else {
        form.reset({
          businessName: "",
          taxId: "",
          contactName: "",
          email: "",
          phone: "",
          isActive: true,
        });
      }
    }
  }, [client, form, open]);

  const mutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const { email, phone, contactName, ...rest } = values;

      // Estructuramos el payload para el backend (NestJS/Prisma)
      const payload = {
        ...rest,
        contactInfo: {
          email,
          phone,
          name: contactName, // Se guarda como 'name' dentro de contactInfo
        },
      };

      return isEditing
        ? await api.patch(`/clients/${client?.id}`, payload)
        : await api.post("/clients", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(isEditing ? "Cliente actualizado" : "Cliente registrado");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Error inesperado al procesar la solicitud";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles.sheetContent}>
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <Building2 className={styles.titleIcon} size={24} />
            {isEditing ? "Editar Cliente" : "Registro de Cliente"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? `Modifica los datos legales y de contacto de ${client?.businessName}.`
              : "Ingresa la información necesaria para crear el perfil del cliente."}
          </SheetDescription>
        </SheetHeader>

        <div className={styles.scrollArea}>
          <form
            id="client-form"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
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
                  <Label htmlFor="businessName" className={styles.fieldLabel}>
                    Razón Social *
                  </Label>
                  <Input
                    {...form.register("businessName")}
                    id="businessName"
                    placeholder="Ej: Vitalia Energy S.A.S"
                    className={
                      form.formState.errors.businessName
                        ? styles.inputError
                        : ""
                    }
                  />
                  {form.formState.errors.businessName && (
                    <p className={styles.errorText}>
                      {form.formState.errors.businessName.message}
                    </p>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="taxId" className={styles.fieldLabel}>
                    NIT / Tax ID *
                  </Label>
                  <Input
                    {...form.register("taxId")}
                    id="taxId"
                    placeholder="900.000.000-1"
                  />
                  {form.formState.errors.taxId && (
                    <p className={styles.errorText}>
                      {form.formState.errors.taxId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección Contacto */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Contact size={16} />
                <span className={styles.sectionLabel}>
                  Información de Contacto
                </span>
              </div>

              <div className={styles.fieldGrid}>
                {/* Nombre de la persona de contacto */}
                <div
                  className={styles.fieldGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Label htmlFor="contactName" className={styles.fieldLabel}>
                    Nombre de la persona de contacto *
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-muted-foreground"
                      size={16}
                    />
                    <Input
                      {...form.register("contactName")}
                      id="contactName"
                      placeholder="Ej: Juan Pérez"
                      className={`pl-10 ${form.formState.errors.contactName ? styles.inputError : ""}`}
                    />
                  </div>
                  {form.formState.errors.contactName && (
                    <p className={styles.errorText}>
                      {form.formState.errors.contactName.message}
                    </p>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="email" className={styles.fieldLabel}>
                    Email Corporativo
                  </Label>
                  <Input
                    {...form.register("email")}
                    id="email"
                    type="email"
                    placeholder="admin@vitalia.com"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="phone" className={styles.fieldLabel}>
                    Teléfono
                  </Label>
                  <Input
                    {...form.register("phone")}
                    id="phone"
                    placeholder="+57 300..."
                  />
                </div>
              </div>
            </div>

            {/* Configuración de Estado */}
            <div className={styles.configBox}>
              <div className={styles.configInfo}>
                <Label className={styles.configTitle}>
                  Estado de la cuenta
                </Label>
                <p className={styles.configSub}>
                  Determina si el cliente puede operar en la plataforma.
                </p>
              </div>
              <Controller
                control={form.control}
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
            className={styles.submitBtn}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Procesando...
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Registrar Cliente"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
