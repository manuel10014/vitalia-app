"use client";

import { useState } from "react"; //  Importamos useState
import { useProtocols } from "@/hooks/useProtocols";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Settings2, Plus, Zap } from "lucide-react";
import Link from "next/link";
import styles from "./protocols.module.css";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { cn } from "@/lib/utils";
import { EditProtocolModal } from "@/components/admin/protocols/editProtocolModal";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { OrganizationProtocol } from "@/types";

export default function ProtocolsPage() {
  const queryClient = useQueryClient();
  const { protocols = [], isLoading } = useProtocols() as {
    protocols: OrganizationProtocol[];
    isLoading: boolean;
  };

  //  ESTADOS PARA EL MODAL
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    versionId: string | null;
    name: string;
  }>({
    isOpen: false,
    versionId: null,
    name: "",
  });

  const openConfig = (versionId: string, name: string) => {
    setModalConfig({ isOpen: true, versionId, name });
  };

  const handleCreateInitialVersion = async (protocolId: string) => {
    const payload = {
      versionNumber: 1,
      description: "Versión base inicial",
      isActive: true,
      schemaDefinition: {
        sections: [],
        version: "1.0",
      },
      formulaDefinition: {},
      requirements: {},
      pdfTemplateMapping: {},
      changeLog: "Inicialización del servicio",
    };

    try {
      await api.post(`/org-protocols/${protocolId}/versions`, payload);
      queryClient.invalidateQueries({ queryKey: ["protocols"] });

      toast.success("Servicio inicializado correctamente");
    } catch {
      toast.error("No se pudo inicializar el servicio");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.labelGroup}>
          <div className={styles.labelEngineering}>
            <Zap size={16} className="text-blue-600" />
            <span>Catálogo de Servicios</span>
          </div>
          <h1 className={styles.title}>Servicios Técnicos Disponibles</h1>
          <p className={styles.subtitle}>
            Personalice los formularios de captura y la lógica de validación
            para cada tipo de ensayo de ingeniería.
          </p>
        </div>

        <Link href="/admin/protocols/library">
          <Button className="gap-2 shadow-lg shadow-blue-100 font-bold bg-blue-600 hover:bg-blue-700">
            <Plus size={16} />
            Adoptar de Biblioteca Global
          </Button>
        </Link>
      </header>

      <div className={styles.tableContainer}>
        <DataTable<OrganizationProtocol>
          data={protocols}
          isLoading={isLoading}
          emptyMessage="No has adoptado servicios aún..."
          columns={[
            {
              header: "Nombre del Servicio",
              render: (p) => (
                <div className={styles.protocolCell}>
                  <div className={styles.iconBox}>
                    <FileText size={20} className="text-slate-500" />
                  </div>
                  <div className={styles.protocolInfo}>
                    <span className={styles.protocolName}>
                      {p.globalProtocol.name}
                    </span>
                    <span className={styles.protocolRef}>
                      ESTÁNDAR: {p.globalProtocol.code}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Categoría",
              render: (p) => (
                <Badge
                  variant="secondary"
                  className="font-bold uppercase text-[10px]"
                >
                  {p.globalProtocol.category}
                </Badge>
              ),
            },
            {
              header: "Estado",
              render: (p) => {
                const activeVer =
                  p.versions?.find((v) => v.isActive) || p.versions?.[0];
                return (
                  <div className={styles.statusGroup}>
                    <span
                      className={cn(
                        styles.statusBadge,
                        activeVer?.isActive ? styles.active : styles.draft,
                      )}
                    >
                      {!activeVer
                        ? "PENDIENTE"
                        : `v${activeVer.versionNumber} ${activeVer.isActive ? "ACTIVO" : "EN DISEÑO"}`}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Acción",
              render: (p) => {
                // Buscamos si existe alguna versión (activa o la primera de la lista)
                const targetVersion =
                  p.versions?.find((v) => v.isActive) || p.versions?.[0];

                return (
                  <div className="flex items-center gap-2">
                    {targetVersion ? (
                      // SI EXISTE: Botón de configuración normal
                      <Button
                        onClick={() =>
                          openConfig(targetVersion.id, p.globalProtocol.name)
                        }
                        variant="outline"
                        size="sm"
                        className="gap-2 font-black border-blue-200 text-blue-700 h-8 text-[11px]"
                      >
                        <Settings2 size={14} /> CONFIGURAR FORMULARIO
                      </Button>
                    ) : (
                      // NO EXISTE: Botón para crear la versión base
                      <Button
                        onClick={() => handleCreateInitialVersion(p.id)} // Necesitas esta función
                        variant="destructive"
                        size="sm"
                        className="gap-2 font-black h-8 text-[11px] animate-pulse"
                      >
                        <Plus size={14} /> ESTABLECER VERSIÓN BASE
                      </Button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      <EditProtocolModal
        isOpen={modalConfig.isOpen}
        versionId={modalConfig.versionId}
        protocolName={modalConfig.name}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}
