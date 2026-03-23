"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestRun, PaginatedResponse } from "@/types";
import {
  ClipboardCheck,
  Activity,
  AlertCircle,
  Clock,
  FileSearch,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { RunTestDialog } from "@/components/admin/runTests/run-test-dialog";
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
      PASSED: {
        label: "Aprobado",
        color: "bg-green-100 text-green-700",
        icon: ClipboardCheck,
      },
      FAILED: {
        label: "Fallido",
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      },
      IN_PROGRESS: {
        label: "En Ejecución",
        color: "bg-blue-100 text-blue-700",
        icon: Activity,
      },
      SUBMITTED: {
        label: "En Revisión",
        color: "bg-purple-100 text-purple-700",
        icon: FileSearch,
      },
    };

    return (
      configs[status] || { label: status, color: "bg-gray-100", icon: Clock }
    );
  };
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Ejecuciones Técnicas</h1>
          <p className={styles.subtitle}>
            Gestión de protocolos y captura de datos de ingeniería.
          </p>
        </div>
        {/* Diálogo de creación que ya teníamos */}
        <RunTestDialog />
      </header>

      <div className={styles.tableCard}>
        <DataTable<TestRun>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Activo / Dispositivo",
              render: (tr) => (
                <div className={styles.assetInfo}>
                  <span className={styles.assetName}>
                    {tr.asset?.name || "Sin Nombre"}
                  </span>
                  <span className={styles.assetMeta}>
                    TAG: {tr.asset?.tagId}
                  </span>
                </div>
              ),
            },
            {
              header: "OT Referencia",
              render: (tr) => (
                <Link href={`/admin/work-orders/${tr.workOrderId}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-50 gap-1 font-mono"
                  >
                    #{tr.workOrderId.split("-")[0]}
                    <ExternalLink size={10} />
                  </Badge>
                </Link>
              ),
            },
            {
              header: "Estado",
              render: (tr) => {
                const config = getStatusConfig(tr.status);
                return (
                  <Badge
                    className={`${config.color} border-none flex w-fit gap-1 items-center px-2 py-0.5 shadow-sm`}
                  >
                    <config.icon size={12} /> {config.label}
                  </Badge>
                );
              },
            },
            {
              header: "Tiempos",
              render: (tr) => (
                <div className={styles.timeInfo}>
                  <div>
                    <span className={styles.timeLabel}>Inició:</span>{" "}
                    {tr.startedAt
                      ? new Date(tr.startedAt).toLocaleDateString()
                      : "-"}
                  </div>
                  <div className="font-medium">
                    <span className={styles.timeLabel}>Finalizó:</span>{" "}
                    {tr.finishedAt
                      ? new Date(tr.finishedAt).toLocaleDateString()
                      : "---"}
                  </div>
                </div>
              ),
            },
            {
              header: "Acciones",
              render: (tr) => (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Link href={`/admin/test-runs/${tr.id}`}>Detalles</Link>
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
