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
  Clock,
  FileSearch,
  ExternalLink,
  LucideIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
// 🟢 Cambiamos al nuevo Launcher
import { RunTestLauncher } from "@/components/admin/runTests/RunTestLauncher";
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
        icon: CheckCircle2,
      },
      FAILED: {
        label: "Falla Crítica",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      IN_PROGRESS: {
        label: "En Campo",
        color: "bg-blue-100 text-blue-700",
        icon: Activity,
      },
      SUBMITTED: {
        label: "Por Revisar",
        color: "bg-amber-100 text-amber-700",
        icon: FileSearch,
      },
      APPROVED: {
        label: "Certificado",
        color: "bg-teal-100 text-teal-700",
        icon: ClipboardCheck,
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
            Monitoreo en tiempo real de pruebas y protocolos de ingeniería.
          </p>
        </div>
        {/* 🟢 Launcher que inicia el flujo de 3 pasos */}
        <RunTestLauncher />
      </header>

      <div className={styles.tableCard}>
        <DataTable<TestRun>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Activo / Equipo",
              render: (tr) => (
                <div className={styles.assetInfo}>
                  <span className={styles.assetName}>
                    {tr.asset?.name || "Sin Nombre"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    ID: {tr.asset?.tagId}
                  </span>
                </div>
              ),
            },
            {
              header: "Orden de Trabajo",
              render: (tr) => (
                <Link href={`/admin/work-orders/${tr.workOrderId}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 border-blue-200 text-blue-700 gap-1 font-mono py-1"
                  >
                    {/* 🟢 Usamos el code de la OT si está disponible */}
                    {tr.workOrder?.code || `#${tr.workOrderId.split("-")[0]}`}
                    <ExternalLink size={10} />
                  </Badge>
                </Link>
              ),
            },
            {
              header: "Protocolo Aplicado",
              render: (tr) => (
                <span className="text-sm font-medium text-slate-600">
                  {tr.protocolVersion?.organizationProtocol.globalProtocol.name}
                  <span className="ml-1 text-[10px] text-slate-400 italic">
                    v{tr.protocolVersion?.versionNumber}
                  </span>
                </span>
              ),
            },
            {
              header: "Estado",
              render: (tr) => {
                const config = getStatusConfig(tr.status);
                return (
                  <Badge
                    className={`${config.color} border-none flex w-fit gap-1 items-center px-2 py-1 shadow-sm font-bold text-[10px]`}
                  >
                    <config.icon size={12} /> {config.label.toUpperCase()}
                  </Badge>
                );
              },
            },
            {
              header: "Fecha Ejecución",
              render: (tr) => (
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700">
                    {tr.createdAt
                      ? new Date(tr.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tr.createdAt
                      ? new Date(tr.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ),
            },
            {
              header: "Acciones",
              render: (tr) => (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Link href={`/admin/test-runs/${tr.id}`}>Ver Datos</Link>
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
