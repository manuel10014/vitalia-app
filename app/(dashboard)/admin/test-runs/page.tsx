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
            Monitoreo en tiempo real de pruebas y servicios de ingeniería.
          </p>
        </div>
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
                  <span className="font-bold text-slate-800">
                    {tr.asset?.name || "Sin Nombre"}
                  </span>
                  {/* El TagID se mantiene como referencia pequeña abajo */}
                  <span className="text-[10px] text-slate-400 font-medium">
                    TAG: {tr.asset?.tagId || "N/A"}
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
                    {tr.workOrder?.code || `#${tr.workOrderId.split("-")[0]}`}
                    <ExternalLink size={10} />
                  </Badge>
                </Link>
              ),
            },
            {
              header: "Servicio Aplicado", //  Cambiado de "Protocolo" a "Servicio"
              render: (tr) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">
                    {tr.protocolVersion?.organizationProtocol?.globalProtocol
                      ?.name || "Servicio no definido"}
                  </span>
                  <span className="text-[10px] text-slate-400 italic">
                    Versión técnica v{tr.protocolVersion?.versionNumber || "?"}
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
            // ... resto de las columnas
            {
              header: "Acciones",
              render: (tr) => {
                const isInProgress = tr.status === "IN_PROGRESS";

                return (
                  <div className="flex gap-2">
                    {isInProgress ? (
                      // Botón para continuar si está en campo
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] h-8 shadow-sm"
                      >
                        <Link href={`/admin/test-runs/execute/${tr.id}`}>
                          CONTINUAR PRUEBA
                        </Link>
                      </Button>
                    ) : (
                      // Botón para ver resultados si ya terminó
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-slate-600 border-slate-200 hover:bg-slate-50 font-black text-[10px] h-8"
                      >
                        <Link href={`/admin/test-runs/${tr.id}`}>
                          VER DATOS
                        </Link>
                      </Button>
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
