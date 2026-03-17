"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { TestRun, PaginatedResponse } from "@/types";
import {
  ClipboardCheck,
  Activity,
  AlertCircle,
  Clock,
  LucideIcon,
} from "lucide-react";
import styles from "./test-runs.module.css";

export default function TestRunsPage() {
  const { data: response, isLoading } = useQuery<PaginatedResponse<TestRun>>({
    queryKey: ["admin", "test-runs"],
    queryFn: async () => (await api.get("/test-runs")).data,
  });
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: string; icon: LucideIcon }
    > = {
      COMPLETED: {
        label: "Completado",
        color: "bg-green-100 text-green-700",
        icon: ClipboardCheck,
      },
      IN_PROGRESS: {
        label: "En Curso",
        color: "bg-blue-100 text-blue-700",
        icon: Activity,
      },
      FAILED: {
        label: "Fallido",
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      },
      PENDING: {
        label: "Pendiente",
        color: "bg-amber-100 text-amber-700",
        icon: Clock,
      },
    };

    return configs[status] || configs.PENDING;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ejecuciones Técnicas (Test Runs)</h1>
        <p className={styles.subtitle}>
          Monitoreo de pruebas y captura de datos en tiempo real.
        </p>
      </header>

      <div className={styles.tableCard}>
        <DataTable<TestRun>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Activo / Protocolo",
              render: (tr) => (
                <div className="flex flex-col">
                  <span className="font-bold">{tr.asset?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tr.protocolVersionId}
                  </span>
                </div>
              ),
            },
            {
              header: "Estado",
              render: (tr) => {
                const config = getStatusConfig(tr.status);
                return (
                  <Badge
                    className={`${config.color} border-none flex w-fit gap-1 items-center`}
                  >
                    <config.icon size={12} /> {config.label}
                  </Badge>
                );
              },
            },
            {
              header: "Inicio / Fin",
              render: (tr) => (
                <div className="text-xs">
                  <div>
                    Start:{" "}
                    {tr.startedAt
                      ? new Date(tr.startedAt).toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-muted-foreground italic">
                    End:{" "}
                    {tr.finishedAt
                      ? new Date(tr.finishedAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
