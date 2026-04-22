"use client";

import { useState, useMemo } from "react";
import { useProtocols, GlobalProtocol } from "@/hooks/useProtocols";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation"; //  Para navegación
import {
  BookOpen,
  Search,
  Settings2, //  Icono más técnico
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import styles from "./library.module.css";
import { CreateGlobalProtocolModal } from "@/components/admin/protocols/createGlobalProtocols";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { globalProtocols, isLoading, adoptProtocol } = useProtocols();

  const filtered = useMemo(() => {
    const protocols = globalProtocols || [];
    if (!search) return protocols;

    const lowerSearch = search.toLowerCase();
    return protocols.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.category.toLowerCase().includes(lowerSearch) ||
        p.code.toLowerCase().includes(lowerSearch),
    );
  }, [globalProtocols, search]);

  interface AdoptResponse {
    id: string;
    organizationId: string;
    globalProtocolId: string;
    activeVersionId: string; // El ID que necesitamos para el router
  }
  const handleAction = (gpId: string) => {
    adoptProtocol.mutate(gpId, {
      onSuccess: (data: AdoptResponse) => {
        toast.success("Norma vinculada con éxito.");
        if (data?.activeVersionId) {
          router.push(`/admin/protocols/builder/${data.activeVersionId}`);
        }
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 409) {
          toast.info("Este servicio ya está en Vitalia. Redirigiendo...");
          router.push("/admin/protocols");
        } else {
          toast.error("Error al procesar la norma técnica.");
        }
      },
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/protocols" className={styles.backLink}>
          <ArrowLeft size={16} /> Volver a mis protocolos
        </Link>

        <div className={styles.titleSection}>
          <div className={styles.titleGroup}>
            <div className={styles.pageLabel}>
              <ShieldCheck size={14} />
              <span>Estándares Globales</span>
            </div>
            <h1 className={styles.title}>Biblioteca Técnica</h1>
          </div>

          <div className={styles.actionsGroup}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <Input
                placeholder="Buscar norma o equipo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <CreateGlobalProtocolModal />
          </div>
        </div>
      </header>

      <div className={styles.tableCard}>
        <DataTable<GlobalProtocol>
          data={filtered}
          isLoading={isLoading}
          emptyMessage={
            search
              ? `No se encontraron resultados para "${search}"`
              : "No hay estándares registrados en la biblioteca global."
          }
          columns={[
            {
              header: "Norma de rereferencia",
              render: (gp) => (
                <div className={styles.codeCell}>
                  <div className={styles.iconBox}>
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                  <div className={styles.flexColumn}>
                    <span className={styles.primaryText}>{gp.code}</span>
                    <span className={styles.secondaryText}>
                      Referencia Técnica
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Descripción del Protocolo",
              render: (gp) => (
                <div className={styles.nameCell}>
                  <span className={styles.protocolName}>{gp.name}</span>
                  <Badge variant="outline" className={styles.categoryBadge}>
                    {gp.category}
                  </Badge>
                </div>
              ),
            },
            {
              header: "Acciones de Ingeniería",
              render: (gp) => (
                <Button
                  onClick={() => handleAction(gp.id)}
                  disabled={adoptProtocol.isPending}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  {adoptProtocol.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : (
                    <Settings2 className="mr-2" size={14} />
                  )}
                  {adoptProtocol.isPending
                    ? "Configurando..."
                    : "CONFIGURAR SERVICIO"}
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
