"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Building2, Contact, ShieldCheck } from "lucide-react";
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
      email: "",
      phone: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (client) {
        const contact = client.contactInfo || {};
        form.reset({
          businessName: client.businessName,
          taxId: client.taxId || "",
          email: contact.email ?? "",
          phone: contact.phone ? String(contact.phone) : "",
          isActive: client.isActive,
        });
      } else {
        form.reset({
          businessName: "",
          taxId: "",
          email: "",
          phone: "",
          isActive: true,
        });
      }
    }
  }, [client, form, open]);

  const mutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const { email, phone, ...rest } = values;
      const payload = { ...rest, contactInfo: { email, phone } };
      return isEditing
        ? await api.patch(`/clients/${client.id}`, payload)
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
        : "Error inesperado";
      toast.error(msg);
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
              ? `Modifica los datos legales de ${client?.businessName}.`
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
                    NIT
                  </Label>
                  <Input
                    {...form.register("taxId")}
                    id="taxId"
                    placeholder="900.000.000-1"
                  />
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

              <div
                className={`${styles.fieldGrid} sm:grid-cols-2`}
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                }}
              >
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

            {/* Configuración */}
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
