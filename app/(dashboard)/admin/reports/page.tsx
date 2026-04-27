"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ShieldCheck,
  Search,
  FileSearch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginatedResponse } from "@/types";
import Link from "next/link";

//  Tipado para el Snapshot de Reporte
interface ReportSnapshot {
  id: string;
  reportNumber: string;
  hash: string;
  pdfUrl: string;
  testRunId: string;
  createdAt: string;
  testRun?: {
    protocolVersion?: {
      organizationProtocol?: {
        globalProtocol?: {
          name: string;
        };
      };
    };
    asset?: {
      name: string;
    };
  };
}

export default function ReportsPage() {
  const { data: response, isLoading } = useQuery<
    PaginatedResponse<ReportSnapshot>
  >({
    queryKey: ["report-snapshots"],
    queryFn: async () => (await api.get("/report-snapshots")).data,
  });

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Certificados y Reportes
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Archivo maestro de snapshots técnicos y trazabilidad legal.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Buscar por Nº de Reporte o Hash..."
            className="pl-10 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-blue-500"
          />
        </div>
      </header>

      {/* TABLA DE REPORTES */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable<ReportSnapshot>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Documento",
              render: (report) => (
                <div className="flex items-center gap-4 py-2">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {report.testRun?.protocolVersion?.organizationProtocol
                        ?.globalProtocol?.name || "Reporte Técnico"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Nº {report.reportNumber}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Trazabilidad",
              render: (report) => (
                <div className="flex flex-col text-left gap-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-green-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-600 truncate max-w-[150px]">
                      {report.hash}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                    Integridad Verificada
                  </span>
                </div>
              ),
            },
            {
              header: "Fecha de Emisión",
              render: (report) => (
                <div className="text-left flex flex-col">
                  <span className="text-sm font-bold text-slate-700">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(report.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ),
            },
            {
              header: "Acciones",
              render: (report) => (
                <div className="flex items-center gap-2">
                  {/* Botón Ver Online */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Link href={`/admin/test-runs/${report.testRunId}`}>
                      <FileSearch size={18} />
                    </Link>
                  </Button>

                  {/* Botón Descargar PDF */}
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] h-8 rounded-lg gap-2"
                    onClick={() => window.open(report.pdfUrl, "_blank")}
                  >
                    <Download size={14} /> PDF
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
