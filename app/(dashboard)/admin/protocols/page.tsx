"use client";

import { useProtocols } from "@/hooks/useProtocols";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Settings2, Plus } from "lucide-react";
import Link from "next/link";
import styles from "./protocols.module.css";
import { DataTable } from "@/components/admin/dataTable/DataTable";

export default function ProtocolsPage() {
  const { protocols = [], isLoading } = useProtocols();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.labelGroup}>
          <div className={styles.labelEngineering}>
            <Settings2 size={20} />
            <span>Ingeniería</span>
          </div>
          <h1 className={styles.title}>Protocolos de Ensayo</h1>
          <p className={styles.subtitle}>
            Configuración de formularios dinámicos y lógica de captura para
            técnicos.
          </p>
        </div>

        <Link href="/admin/protocols/library">
          <Button className="gap-2 shadow-lg shadow-blue-100 font-bold">
            <Plus size={16} />
            Adoptar de Biblioteca
          </Button>
        </Link>
      </header>

      <div className={styles.tableContainer}>
        <DataTable
          data={protocols}
          isLoading={isLoading}
          emptyMessage="No has adoptado protocolos aún. Visita la biblioteca global para elegir los estándares técnicos."
          columns={[
            {
              header: "Nombre del Protocolo",
              render: (p) => (
                <div className={styles.protocolCell}>
                  <div className={styles.iconBox}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.protocolInfo}>
                    <span className={styles.protocolName}>
                      {p.globalProtocol.name}
                    </span>
                    <span className={styles.protocolRef}>
                      REF: {p.globalProtocol.code}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Categoría",
              render: (p) => (
                <Badge variant="secondary" className="font-semibold">
                  {p.globalProtocol.category}
                </Badge>
              ),
            },
            {
              header: "Estado Ingeniería",
              render: (p) => {
                const activeVer =
                  p.versions.find((v) => v.isActive) || p.versions[0];
                return (
                  <div className={styles.statusGroup}>
                    <span
                      className={`${styles.statusBadge} ${
                        activeVer?.isActive ? styles.active : styles.draft
                      }`}
                    >
                      {activeVer
                        ? `v${activeVer.versionNumber} ${
                            activeVer.isActive ? "Activa" : "Borrador"
                          }`
                        : "Sin versión"}
                    </span>
                    <span className={styles.updateText}>
                      {activeVer
                        ? `Editado: ${new Date(
                            activeVer.updatedAt,
                          ).toLocaleDateString()}`
                        : "N/A"}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Acciones",
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
                          className="gap-2 font-bold hover:bg-blue-50"
                        >
                          <Settings2 size={12} /> Diseñar Formulario
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">
                        Error: Sin versión
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
