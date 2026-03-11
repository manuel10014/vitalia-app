"use client";

import { useWorkOrders, WorkOrder } from "@/hooks/useWorkOrders";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User } from "lucide-react";
import styles from "./workorders.module.css";

export default function WorkOrdersPage() {
  const { workOrders, isLoading } = useWorkOrders();

  const getStatusClass = (status: WorkOrder["status"]) => {
    const classes: Record<string, string> = {
      DRAFT: styles.statusDRAFT,
      ASSIGNED: styles.statusASSIGNED,
      IN_PROGRESS: styles.statusIN_PROGRESS,
      REVIEW_PENDING: styles.statusREVIEW_PENDING,
      APPROVED: styles.statusAPPROVED,
      REJECTED: styles.statusREJECTED,
    };
    return classes[status] || "";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Órdenes de Trabajo</h1>
          <p className={styles.subtitle}>
            Gestiona la asignación y el progreso de los técnicos en campo.
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} /> Nueva OT
        </Button>
      </header>

      <DataTable<WorkOrder>
        data={workOrders || []}
        isLoading={isLoading}
        columns={[
          {
            header: "Proyecto",
            render: (row) => (
              <span className={styles.projectName}>{row.project.name}</span>
            ),
          },
          {
            header: "Técnico Asignado",
            render: (row) => (
              <div className={styles.techCell}>
                <User className={styles.icon} />
                <span className={styles.techName}>
                  {row.technician?.fullName || "Sin asignar"}
                </span>
              </div>
            ),
          },
          {
            header: "Fecha Programada",
            render: (row) => (
              <div className={styles.dateCell}>
                <Calendar className={styles.icon} />
                <span className={styles.dateText}>
                  {row.scheduledDate
                    ? new Date(row.scheduledDate).toLocaleDateString()
                    : "Pendiente"}
                </span>
              </div>
            ),
          },
          {
            header: "Estado",
            render: (row) => (
              <Badge
                className={`${styles.badgeBase} ${getStatusClass(row.status)}`}
              >
                {row.status.replace("_", " ")}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
