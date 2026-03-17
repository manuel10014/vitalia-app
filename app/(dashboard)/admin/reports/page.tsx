"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { ReportSnapshot, PaginatedResponse } from "@/types";
import { FileText, Download, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./reports.module.css";

export default function ReportsPage() {
  const { data: response, isLoading } = useQuery<
    PaginatedResponse<ReportSnapshot>
  >({
    queryKey: ["admin", "reports"],
    queryFn: async () => (await api.get("/reports")).data,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Certificados y Reportes</h1>
          <p className={styles.subtitle}>
            Archivo maestro de snapshots técnicos y trazabilidad legal.
          </p>
        </div>
        <div className={styles.searchBar}>
          <Search size={18} className="text-gray-400" />
          <Input
            placeholder="Buscar por Nº de Reporte o Hash..."
            className="border-none focus-visible:ring-0"
          />
        </div>
      </header>

      <div className={styles.tableCard}>
        <DataTable<ReportSnapshot>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Documento",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{r.reportName}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      ID: {r.id.split("-")[0]}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Trazabilidad",
              render: () => (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <ShieldCheck size={14} /> Snapshot Firmado
                </div>
              ),
            },
            {
              header: "Fecha de Emisión",
              render: (r) => (
                <span className="text-sm">
                  {r.issuedAt
                    ? new Date(r.issuedAt).toLocaleDateString()
                    : "No emitida"}
                </span>
              ),
            },
            {
              header: "Acciones",
              render: (r) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(r.pdfUrl || "#", "_blank")}
                >
                  <Download size={14} /> PDF
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
