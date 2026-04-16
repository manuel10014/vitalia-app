"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Calendar, Search, ShieldCheck, FileText } from "lucide-react";
import styles from "./equipment.module.css";
import { CreateEquipmentModal } from "@/components/admin/equipment/CreateEquipmentModal";
import { useEquipment } from "@/hooks/useEquipment";
import { MeasurementEquipment } from "@/types";

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allEquipment = [], isLoading } = useEquipment();

  const filteredEquipment = useMemo(() => {
    return allEquipment.filter((e: MeasurementEquipment) => {
      const search = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(search) ||
        (e.internalCode?.toLowerCase().includes(search) ?? false) ||
        (e.serialNumber?.toLowerCase().includes(search) ?? false)
      );
    });
  }, [allEquipment, searchTerm]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.pageLabel}>
            <Zap size={14} />
            <span>Herramental Técnico</span>
          </div>
          <h1 className={styles.title}>Equipos de Medición</h1>
          <p className={styles.subtitle}>
            Gestión de trazabilidad, certificados y vencimiento de calibración.
          </p>
        </div>

        <div className={styles.actionsBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <Input
              placeholder="Buscar por serie, código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <CreateEquipmentModal />
        </div>
      </header>

      <div className={styles.tableCard}>
        {/* DataTable centraliza ahora el feedback visual y el manejo de carga */}
        <DataTable<MeasurementEquipment>
          data={filteredEquipment}
          isLoading={isLoading}
          emptyMessage="No se encontraron equipos de medición que coincidan con la búsqueda."
          columns={[
            {
              header: "Equipo / Identificación",
              render: (e) => (
                <div className={styles.equipmentCell}>
                  <div className={styles.iconBox}>
                    <ShieldCheck size={20} className="text-blue-600" />
                  </div>
                  <div className={styles.flexColumn}>
                    <span className={styles.primaryText}>{e.name}</span>
                    <span className={styles.secondaryText}>
                      {e.internalCode ?? "SIN CÓDIGO"} • SN:{" "}
                      {e.serialNumber ?? "S/N"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Estado / Vencimiento",
              render: (e) => {
                const isExpired = e.calibrationDueAt
                  ? new Date(e.calibrationDueAt) < new Date()
                  : false;

                return (
                  <div className={styles.statusCell}>
                    <Badge
                      className={isExpired ? styles.bgError : styles.bgSuccess}
                    >
                      {isExpired ? "Vencido" : "Vigente"}
                    </Badge>
                    <div className={styles.dateGroup}>
                      <Calendar size={12} />
                      <span>
                        Prox:
                        {e.calibrationDueAt
                          ? new Date(e.calibrationDueAt).toLocaleDateString()
                          : "Pendiente"}
                      </span>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Certificado",
              render: (e) => (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!e.certificateUrl}
                  className="gap-2 text-blue-600"
                  onClick={() =>
                    e.certificateUrl && window.open(e.certificateUrl, "_blank")
                  }
                >
                  <FileText size={16} /> Ver PDF
                </Button>
              ),
            },
            {
              header: "Acciones",
              render: () => (
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
