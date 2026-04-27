"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  TestRun,
  OrganizationProtocolVersion,
  CapturedValue,
  TestStatus,
  WorkOrder,
  Asset,
  CapturedDataRecord,
  TestRunEquipment,
} from "@/types";
import { useDynamicForm } from "@/hooks/useDynamicForm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ChevronLeft,
  FileText,
  Box,
  Wrench,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { RunTestForm } from "./RunTestForm";
import styles from "./RunTest.module.css"; // Asegúrate de que este archivo exista

export default function RunTestExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const testRunId = params.id as string;

  const {
    data: testRun,
    isSuccess,
    isLoading: ldRun,
  } = useQuery<TestRun>({
    queryKey: ["test-runs", testRunId],
    queryFn: async () => {
      const res = await api.get(`/test-runs/${testRunId}`);
      return res.data?.data?.[0] || res.data?.[0] || res.data?.data || res.data;
    },
    enabled: !!testRunId,
  });

  const [localNumCond, setLocalNumCond] = useState<number | null>(null);
  const [localFases, setLocalFases] = useState<string[] | null>(null);

  const meta = (testRun?.metadata as Record<string, unknown>) || {};
  const numCond = (localNumCond ?? (meta.numConductores as number)) || 1;
  const fasesConfiguradas = (localFases ?? (meta.fases as string[])) || [
    "A",
    "B",
    "C",
  ];

  const updateNetworkMutation = useMutation({
    mutationFn: async ({ n, f }: { n: number; f: string[] }) => {
      return await api.patch(`/test-runs/${testRunId}`, {
        metadata: {
          ...((testRun?.metadata as object) || {}),
          numConductores: n,
          fases: f,
        },
      });
    },
    onMutate: async ({ n, f }) => {
      setLocalNumCond(n);
      setLocalFases(f);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs", testRunId] });
      setLocalNumCond(null);
      setLocalFases(null);
      toast.success("Estructura de red actualizada");
    },
  });

  const phaseOptions = [
    { label: "MONOFÁSICO", values: ["A"] },
    { label: "BIFÁSICO", values: ["A", "B"] },
    { label: "TRIFÁSICO", values: ["A", "B", "C"] },
  ];

  const protocolVersion =
    testRun?.protocolVersion as OrganizationProtocolVersion;
  const workOrder = testRun?.workOrder as WorkOrder;
  const asset = testRun?.asset as Asset;
  const linkedEquipments = (testRun?.equipments as TestRunEquipment[]) || [];

  const { formData, handleInputChange } = useDynamicForm(
    protocolVersion?.schemaDefinition,
  );

  useEffect(() => {
    const remoteData = testRun?.data?.capturedData || testRun?.values;
    if (
      isSuccess &&
      remoteData &&
      protocolVersion?.schemaDefinition?.sections
    ) {
      Object.entries(
        remoteData as Record<string, Record<string, CapturedValue>>,
      ).forEach(([sectionId, fields]) => {
        if (fields && typeof fields === "object") {
          Object.entries(fields).forEach(([fId, val]) => {
            handleInputChange(sectionId, fId, val);
          });
        }
      });
    }
  }, [isSuccess, testRun, protocolVersion, handleInputChange]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        capturedData: formData as unknown as CapturedDataRecord,
        status: "SUBMITTED" as TestStatus,
      };
      return await api.patch(`/test-runs/${testRunId}`, payload);
    },
    onSuccess: () => {
      toast.success("Ensayo enviado a revisión técnica.");
      router.push("/admin/test-runs");
    },
  });

  if (ldRun)
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <ChevronLeft size={24} />
          </Button>
          <div className={styles.headerTitle}>
            <span className={styles.headerLabel}>Toma de Datos Técnica</span>
            <h1 className={styles.headerName}>
              {protocolVersion?.organizationProtocol?.globalProtocol?.name ||
                "Ejecución"}
            </h1>
          </div>
        </div>
        <Button
          onClick={() => mutation.mutate()}
          className={styles.saveButton}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          FINALIZAR Y ENVIAR
        </Button>
      </header>

      <ScrollArea className={styles.scrollArea}>
        <div className={styles.contentWrapper}>
          {/* CARDS DE CONTEXTO */}
          <div className={styles.contextGrid}>
            <Card className={styles.contextCard}>
              <CardContent className={styles.contextCardContent}>
                <div className={styles.iconBlue}>
                  <FileText size={24} />
                </div>
                <div>
                  <p className={styles.cardLabel}>Orden de Trabajo</p>
                  <p className={styles.cardMainText}>
                    {workOrder?.code || "---"}
                  </p>
                  <p className={styles.cardSubText}>
                    {workOrder?.project?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className={styles.contextCard}>
              <CardContent className={styles.contextCardContent}>
                <div className={styles.iconOrange}>
                  <Box size={24} />
                </div>
                <div>
                  <p className={styles.cardLabel}>Activo</p>
                  <p className={styles.cardMainText}>{asset?.name}</p>
                  <p className={styles.cardSubText}>TAG: {asset?.tagId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CONFIGURACIÓN DINÁMICA DE RED (USANDO CSS MODULES) */}
          <Card className={styles.configCard}>
            <CardContent className={styles.configCardContent}>
              {/* SISTEMA DE FASES */}
              <div className={styles.configRow}>
                <div className={styles.configInfo}>
                  <div className={styles.configIconBox}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <h4 className={styles.configTitle}>Sistema de Fases</h4>
                    <p className={styles.configDescription}>
                      Defina la topología de la red
                    </p>
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  {phaseOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() =>
                        updateNetworkMutation.mutate({
                          n: numCond,
                          f: opt.values,
                        })
                      }
                      className={
                        fasesConfiguradas.length === opt.values.length
                          ? styles.btnActive
                          : styles.btnInactive
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* HILOS POR FASE */}
              <div className={styles.configRow}>
                <div className={styles.configInfo}>
                  <div className={styles.configIconBoxSecondary}>
                    <Box size={22} />
                  </div>
                  <div>
                    <h4 className={styles.configTitle}>Hilos por Fase</h4>
                    <p className={styles.configDescription}>
                      Conductores en paralelo
                    </p>
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        updateNetworkMutation.mutate({
                          n: n,
                          f: fasesConfiguradas,
                        })
                      }
                      className={
                        numCond === n ? styles.btnActive : styles.btnInactive
                      }
                    >
                      {n} {n === 1 ? "CONDUCTOR" : "CONDUCTORES"}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EQUIPOS Y FORMULARIO */}
          <Card className={styles.equipmentCard}>
            <CardContent className={styles.equipmentContent}>
              <div className={styles.equipmentHeader}>
                <div className={styles.equipmentIconBox}>
                  <Wrench size={18} />
                </div>
                <div>
                  <h4 className={styles.equipmentTitle}>
                    Instrumental Vinculado
                  </h4>
                  <p className={styles.equipmentSubtitle}>
                    Equipos verificados para este ensayo
                  </p>
                </div>
              </div>

              <div className={styles.equipmentGrid}>
                {linkedEquipments.length > 0 ? (
                  linkedEquipments.map((eqEntry) => (
                    <div key={eqEntry.id} className={styles.eqItem}>
                      <div className={styles.eqInfo}>
                        <span className={styles.eqName}>
                          {eqEntry.equipment?.name}
                        </span>
                        <span className={styles.eqSerial}>
                          S/N: {eqEntry.equipment?.serialNumber}
                        </span>
                      </div>
                      <div className={styles.eqBadge}>
                        <div className={styles.dot} /> VERIFICADO
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noEquipments}>
                    <AlertTriangle size={16} /> No hay instrumentos vinculados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className={styles.formContainer}>
            <RunTestForm
              protocolVersion={protocolVersion}
              handleInputChange={handleInputChange}
              formData={formData}
              numConductores={numCond}
              fases={fasesConfiguradas}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
