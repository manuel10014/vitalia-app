"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { ReportSnapshot } from "@/types";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsList() {
  const { data: reports, isLoading } = useQuery<ReportSnapshot[]>({
    queryKey: ["reports-snapshots"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ReportSnapshot[] }>("/reports");
      return data.data;
    },
  });

  if (isLoading)
    return <div className="p-4">Cargando reportes maestros...</div>;

  return (
    <div className="grid gap-4">
      {reports?.map((report) => (
        <Card
          key={report.id}
          className="p-4 flex justify-between items-center shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded">
              <FileText className="text-blue-700" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{report.reportName}</p>
              <p className="text-xs text-muted-foreground">
                {/* ✅ Validación añadida para evitar el error de tipos */}
                Emitido:{" "}
                {report.issuedAt
                  ? new Date(report.issuedAt).toLocaleDateString()
                  : "Pendiente"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {report.pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(report.pdfUrl!, "_blank")}
              >
                <Download size={14} /> PDF
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <ExternalLink size={14} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
