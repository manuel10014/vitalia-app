"use client";

import { useState, useMemo } from "react"; // ✅ Añadido useMemo
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Calendar,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";
import styles from "./equipment.module.css";
import { CreateEquipmentModal } from "@/components/admin/equipment/CreateEquipmentModal";
import { useEquipment } from "@/hooks/useEquiment";
import { MeasurementEquipment } from "@/types";

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allEquipment = [], isLoading } = useEquipment();

  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(
      (e: MeasurementEquipment) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    );
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
        <DataTable
          data={filteredEquipment} // ✅ Usamos la variable filtrada
          isLoading={isLoading} // ✅ Usamos el estado de carga real
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
                      {e.internalCode} • SN: {e.serialNumber}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Estado de Calibración",
              render: (e) => (
                <div className={styles.statusCell}>
                  <Badge
                    className={
                      e.status === "EXPIRED" ? styles.bgError : styles.bgSuccess
                    }
                  >
                    {e.status === "CALIBRATED" ? "Calibrado" : "Vencido"}
                  </Badge>
                  <div className={styles.dateGroup}>
                    <Calendar size={12} />
                    <span>
                      Prox: {new Date(e.nextCalibration).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Certificado",
              render: (e) => (
                <Button
                  variant="ghost"
                  size="sm"
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

        {filteredEquipment.length === 0 && !isLoading && (
          <div className={styles.emptyState}>
            <AlertTriangle size={48} className="text-amber-500 mb-4" />
            <p className="font-bold">No se encontraron equipos</p>
            <p className="text-sm text-muted-foreground">
              Intenta con otro término de búsqueda o registra un nuevo equipo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
