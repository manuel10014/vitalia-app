"use client";

import { useWorkOrders } from "@/hooks/useWorkOrders";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import styles from "./workorders.module.css";
import { CreateWorkOrderDialog } from "@/components/admin/workOrders/CreateWorkOrderDialog";
import { WorkOrder } from "@/types";
import { ORDER_STATUS_LABELS, translateStatus } from "@/lib/statusLabels";

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

        <CreateWorkOrderDialog />
      </header>
      <DataTable<WorkOrder>
        data={workOrders || []}
        isLoading={isLoading}
        columns={[
          {
            header: "Proyecto",
            render: (row) => (
              <span className={styles.projectName}>
                {row?.project?.name || ""}
              </span>
            ),
          },
          {
            header: "Cliente",
            render: (row) => (
              <span className={styles.projectName}>
                {row?.project?.client?.businessName || "Sin cliente"}
              </span>
            ),
          },
          {
            header: "Servicio",
            render: (row) => {
              const services = row.plannedServices || [];
              if (services.length === 0) {
                return <span className={styles.techName}>Sin definir</span>;
              }
              const first = services[0].organizationProtocol?.globalProtocol?.name;
              return (
                <span className={styles.techName}>
                  {first}
                  {services.length > 1 && ` +${services.length - 1}`}
                </span>
              );
            },
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
                {translateStatus(ORDER_STATUS_LABELS, row.status)}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
