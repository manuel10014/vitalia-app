"use client";

import { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Building2 } from "lucide-react";
import api from "@/lib/api";

import { useClients } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { ClientFormSheet } from "@/components/admin/clients/createFormSheet";
import { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import styles from "./clients.module.css";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { data: response, isLoading, isFetching } = useClients();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(() => {
    const allClients = response?.data || [];
    if (!searchTerm) return allClients;

    const lowerSearch = searchTerm.toLowerCase();

    return allClients.filter(
      (client) =>
        client.businessName.toLowerCase().includes(lowerSearch) ||
        client.taxId?.toLowerCase().includes(lowerSearch) ||
        client.contactInfo?.email?.toLowerCase().includes(lowerSearch),
    );
  }, [response?.data, searchTerm]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToToggle, setClientToToggle] = useState<Client | null>(null);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setIsSheetOpen(true);
  };
  const mutationToggle = useMutation({
    mutationFn: (client: Client) =>
      api.patch(`/clients/${client.id}/active`, { isActive: !client.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Estado de cuenta actualizado correctamente");
      setClientToToggle(null);
    },
    onError: () => toast.error("Error al cambiar el estado"),
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.adminLabel}>
            <Building2 className="w-5 h-5" />
            <span>Administración</span>
          </div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>
            Gestiona el acceso y datos legales de tus asociados.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Buscar por nombre, NIT o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.inputSearch}
            />
          </div>
          <Button onClick={handleCreate} className={styles.btnNew}>
            <Plus className="w-4 h-4" /> Nuevo
          </Button>
        </div>
      </header>

      <div
        className={`${styles.tableWrapper} ${isFetching ? styles.fetching : ""}`}
      >
        <DataTable<Client>
          data={filteredClients}
          isLoading={isLoading}
          onEdit={handleEdit}
          emptyMessage={`No se encontraron clientes que coincidan`}
          onToggleStatus={(client) => {
            if (client.isActive) setClientToToggle(client);
            else mutationToggle.mutate(client);
          }}
          columns={[
            {
              header: "Empresa",
              render: (c) => (
                <div className={styles.companyCell}>
                  <span className={styles.companyName}>{c.businessName}</span>
                  <span className={styles.uuidLabel}>
                    UUID: {c.id.slice(0, 8)}
                  </span>
                </div>
              ),
            },
            {
              header: "NIT",
              render: (c) => (
                <code className={styles.taxIdBadge}>{c.taxId || "N/A"}</code>
              ),
            },
            {
              header: "Información de Contacto",
              render: (c) => {
                const info = c.contactInfo || {};
                return (
                  <div className={styles.contactInfo}>
                    <span className={styles.emailText}>
                      {info.email || "—"}
                    </span>
                    <span className={styles.phoneText}>
                      {info.phone || "Sin teléfono"}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Estado",
              render: (c) => (
                <span
                  className={`${styles.statusBadge} ${
                    c.isActive ? styles.active : styles.suspended
                  }`}
                >
                  <span className={styles.statusDot} />
                  {c.isActive ? "Activo" : "Suspendido"}
                </span>
              ),
            },
          ]}
        />
      </div>

      <ClientFormSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedClient(null);
        }}
        client={selectedClient}
      />

      <AlertDialog
        open={!!clientToToggle}
        onOpenChange={() => setClientToToggle(null)}
      >
        <AlertDialogContent className={styles.alertDestructive}>
          <AlertDialogHeader>
            <AlertDialogTitle className={styles.alertTitle}>
              ¿Suspender acceso?
            </AlertDialogTitle>
            <AlertDialogDescription className={styles.alertDescription}>
              Vas a deshabilitar a{" "}
              <strong>{clientToToggle?.businessName}</strong>. Ningún
              colaborador de esta empresa podrá acceder a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={styles.alertCancel}>
              Mantener Activo
            </AlertDialogCancel>
            <AlertDialogAction
              className={styles.alertAction}
              onClick={() =>
                clientToToggle && mutationToggle.mutate(clientToToggle)
              }
              disabled={mutationToggle.isPending}
            >
              {mutationToggle.isPending
                ? "Procesando..."
                : "Sí, Suspender Cliente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
