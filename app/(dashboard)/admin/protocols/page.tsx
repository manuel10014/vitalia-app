"use client";

import { OrganizationProtocol, useProtocols } from "@/hooks/useProtocols";
import { OrganizationProtocolVersion } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Settings2, Plus, Zap } from "lucide-react";
import Link from "next/link";
import styles from "./protocols.module.css";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { cn } from "@/lib/utils";

export default function ProtocolsPage() {
  const { protocols = [], isLoading } = useProtocols() as {
    protocols: OrganizationProtocol[];
    isLoading: boolean;
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
          emptyMessage="No has adoptado servicios aún. Visita la biblioteca global para elegir los estándares técnicos."
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
                  className="font-bold uppercase text-[10px] tracking-wider"
                >
                  {p.globalProtocol.category}
                </Badge>
              ),
            },
            {
              header: "Estado de Configuración",
              render: (p: OrganizationProtocol) => {
                const rawVersion =
                  p.versions.find((v) => v.isActive) || p.versions[0];
                const activeVer = rawVersion as unknown as
                  | Omit<OrganizationProtocolVersion, "organizationProtocol">
                  | undefined;

                return (
                  <div className={styles.statusGroup}>
                    <span
                      className={cn(
                        styles.statusBadge,
                        activeVer?.isActive ? styles.active : styles.draft,
                      )}
                    >
                      {activeVer
                        ? `v${activeVer.versionNumber} ${
                            activeVer.isActive ? "ACTIVO" : "EN DISEÑO"
                          }`
                        : "SIN CONFIGURAR"}
                    </span>
                    <span className={styles.updateText}>
                      {activeVer?.updatedAt
                        ? `Último cambio: ${new Date(activeVer.updatedAt).toLocaleDateString()}`
                        : "N/A"}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Diseño Técnico",
              render: (p) => {
                const targetVersion =
                  p.versions.find((v) => v.isActive) || p.versions[0];

                return (
                  <div className="flex items-center gap-2">
                    {targetVersion ? (
                      <Link
                        href={`/admin/protocols/builder/${targetVersion.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-black hover:bg-blue-50 border-blue-200 text-blue-700 h-8 text-[11px]"
                        >
                          <Settings2 size={14} /> CONFIGURAR FORMULARIO
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold uppercase">
                        Error: Datos Corruptos
                      </span>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
