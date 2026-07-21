"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ShieldCheck,
  Search,
  FileSearch,
  Box,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginatedResponse, TestRun, ApiErrorResponse } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { buildVLFReportBlob } from "@/lib/vlfTemplateReportGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import styles from "./reports.module.css";

interface ReportSnapshot {
  id: string;
  reportName: string;
  snapshotHash: string;
  pdfUrl: string | null;
  testRunId: string;
  createdAt: string;
  versionNumber: number;
  testRun?: {
    asset?: {
      name: string;
      tagId: string;
    };
    protocolVersion?: {
      organizationProtocol?: {
        globalProtocol?: {
          name: string;
        };
      };
    };
  };
}

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery<
    PaginatedResponse<ReportSnapshot>
  >({
    queryKey: ["report"],
    queryFn: async () => {
      const res = await api.get("/reports");
      return Array.isArray(res.data) ? { data: res.data } : res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return await api.delete(`/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
      // El detalle del ensayo (test-run) también depende de si el reporte
      // existe o no para mostrar "Reporte Generado" vs "Generar Reporte".
      queryClient.invalidateQueries({ queryKey: ["test-run"] });
      toast.success("Reporte eliminado.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message;
      toast.error(
        (Array.isArray(msg) ? msg.join(" ") : msg) ||
          "Error al eliminar el reporte.",
      );
    },
  });

  // 🟢 GENERA EL EXCEL EN EL CLIENTE, LO DESCARGA Y LO SUBE AL BUCKET
  const handleDownloadExcel = async (report: ReportSnapshot) => {
    try {
      setDownloadingId(report.testRunId);

      // 1. Consultar de forma asíncrona la data completa del TestRun (incluyendo capturedData)
      // Nota: el backend devuelve el TestRun directamente (sin wrapper). El propio TestRun
      // trae una relación llamada "data" (TestRunData con capturedData), así que NO hay que
      // desenvolver res.data.data - eso pisaría el TestRun completo con esa sub-relación.
      const res = await api.get(`/test-runs/${report.testRunId}`);
      const fullTestRunData: TestRun = res.data;

      if (!fullTestRunData) {
        throw new Error(
          "No se recuperaron los datos de ingeniería de la prueba.",
        );
      }

      const { blob, filename } = await buildVLFReportBlob(fullTestRunData);

      // Descarga inmediata para quien lo generó (mismo comportamiento de
      // siempre) — la subida al bucket abajo es adicional, no reemplaza esto.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Subida al bucket de archivos: antes el certificado solo vivía en la
      // descarga local del navegador y se perdía; ahora queda persistido y
      // enlazado al ReportSnapshot (pdfUrl), para que cualquiera pueda
      // volver a abrirlo sin regenerarlo.
      const formData = new FormData();
      formData.append("file", blob, filename);
      await api.post(`/reports/${report.id}/upload`, formData);
      queryClient.invalidateQueries({ queryKey: ["report"] });

      toast.success(
        "Certificado Excel (FO-INDE-013) generado y guardado en el bucket.",
      );
    } catch (error) {
      console.error(error);
      toast.error("Error al compilar las métricas del snapshot.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* HEADER DE CONTROL */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-blue-600" size={20} />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              Vitalia
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Archivo de Certificados
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Documentos generados tras aprobación técnica y firma de
            interventoría.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Buscar por ID, Activo o Hash..."
            className="pl-10 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-blue-500"
          />
        </div>
      </header>

      {/* TABLA DE SNAPSHOTS */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <DataTable<ReportSnapshot>
          data={response?.data || []}
          isLoading={isLoading}
          columns={[
            {
              header: "Documento Certificado",
              render: (report) => (
                <div className="flex items-center gap-4 py-3">
                  <div className="p-3.5 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200">
                    <FileText size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                      {report.reportName || "Reporte de Ingeniería"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none text-[9px] font-black px-2 py-0">
                        v{report.versionNumber}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">
                        ID: {report.id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Activo / TAG",
              render: (report) => (
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                    <Box size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700 uppercase">
                      {report.testRun?.asset?.name || "Activo General"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      TAG: {report.testRun?.asset?.tagId || "N/A"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Hash de Seguridad",
              render: (report) => (
                <div className="flex flex-col text-left group cursor-help">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 truncate max-w-[120px]">
                      {report.snapshotHash}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-300 font-black uppercase tracking-tighter">
                    Inmutable • Vitalia-SHA256
                  </span>
                </div>
              ),
            },
            {
              header: "Emisión",
              render: (report) => (
                <div className="text-left flex flex-col leading-tight">
                  <span className="text-xs font-black text-slate-700">
                    {new Date(report.createdAt)
                      .toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 h-9 font-bold text-[11px]"
                  >
                    <Link href={`/admin/test-runs/${report.testRunId}`}>
                      <FileSearch size={14} className="mr-2" /> REVISAR DATOS
                    </Link>
                  </Button>

                  {/* Regenera el Excel, lo descarga y lo sube al bucket (pdfUrl) */}
                  <Button
                    variant="default"
                    size="sm"
                    disabled={downloadingId === report.testRunId}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] h-9 rounded-xl shadow-md gap-2"
                    onClick={() => handleDownloadExcel(report)}
                  >
                    {downloadingId === report.testRunId ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Download size={14} />
                    )}
                    EXCEL
                  </Button>

                  {/* Ya guardado en el bucket: se puede abrir directo sin regenerar */}
                  {report.pdfUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-9 font-bold text-[11px]"
                    >
                      <a
                        href={report.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} className="mr-2" /> VER GUARDADO
                      </a>
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        disabled={deleteMutation.isPending}
                        aria-label="Eliminar reporte"
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === report.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Eliminar este reporte?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará permanentemente el certificado{" "}
                          <strong>{report.reportName}</strong> (v
                          {report.versionNumber}) y la firma asociada. Esta
                          acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className={styles.confirmActionButton}
                          onClick={() => deleteMutation.mutate(report.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
