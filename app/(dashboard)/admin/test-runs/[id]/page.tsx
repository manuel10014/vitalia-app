"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import SignatureCanvas from "react-signature-canvas";
import {
  Loader2,
  ChevronLeft,
  Box,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PenTool,
  Clock,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TestRun, ProtocolSection, ApiErrorResponse } from "@/types";
import styles from "./TestRunDetail.module.css";
import { AxiosError } from "axios";
import Image from "next/image";

export default function TestRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sigPad = useRef<SignatureCanvas>(null);

  const { data: testRun, isLoading } = useQuery<TestRun>({
    queryKey: ["test-run", id],
    queryFn: async () => {
      const res = await api.get(`/test-runs/${id}`);
      return res.data?.data?.[0] || res.data?.[0] || res.data;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (status: "APPROVED" | "REJECTED") => {
      if (!sigPad.current || sigPad.current.isEmpty()) {
        toast.error("La firma es obligatoria para el dictamen técnico.");
        throw new Error("Firma vacía");
      }
      const signatureData = sigPad.current.toDataURL("image/png");
      return await api.patch(`/test-runs/${id}/review`, {
        status: status,
        reviewSignature: signatureData,
        comments: `Ensayo ${status === "APPROVED" ? "aprobado" : "rechazado"} desde panel administrativo`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-run", id] });
      toast.success("Dictamen técnico procesado y firmado.");
      setIsDialogOpen(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Error en la revisión");
    },
  });

  if (isLoading || !testRun) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // --- LÓGICA DE NEGOCIO PARA RENDEREIZADO ---
  const capturedData = testRun.data?.capturedData || {};
  const sections = (testRun.protocolVersion?.schemaDefinition?.sections ||
    []) as ProtocolSection[];
  const linkedEquipments = testRun.equipments || [];
  const reviewInfo = testRun.metadata?.review;

  // Extraemos configuración de red de los metadatos
  const numConductores = (testRun.metadata?.numConductores as number) || 1;
  const fases = (testRun.metadata?.fases as string[]) || ["A", "B", "C"];

  const normalizeText = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </Button>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
              Registro Técnico
            </span>
            <h1 className="text-xl font-black text-slate-900 leading-none uppercase">
              {testRun.protocolVersion?.organizationProtocol?.globalProtocol
                ?.name || "DETALLE DE ENSAYO"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {testRun.status === "SUBMITTED" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className={styles.reviewButton}>
                  <ShieldCheck className="mr-2" size={18} /> GESTIONAR REVISIÓN
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none p-8">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-black text-slate-800 tracking-tighter">
                    Dictamen Técnico
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500 italic">
                    Capture su firma para validar los datos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className={styles.signaturePadContainer}>
                    <SignatureCanvas
                      ref={sigPad}
                      penColor="#0f172a"
                      canvasProps={{ className: "w-full h-full" }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sigPad.current?.clear()}
                    className="text-[10px] font-black text-slate-400"
                  >
                    <RotateCcw size={12} className="mr-1" /> LIMPIAR
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => mutation.mutate("APPROVED")}
                    disabled={mutation.isPending}
                    className="h-16 bg-green-600 text-white font-black rounded-2xl gap-2"
                  >
                    <CheckCircle2 size={20} /> APROBAR
                  </Button>
                  <Button
                    onClick={() => mutation.mutate("REJECTED")}
                    disabled={mutation.isPending}
                    className="h-16 bg-red-600 text-white font-black rounded-2xl gap-2"
                  >
                    <XCircle size={20} /> RECHAZAR
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Badge className="bg-slate-900 text-white border-none font-black px-4 py-2 text-[10px] uppercase rounded-full">
            {testRun.status}
          </Badge>
        </div>
      </header>

      <ScrollArea className={styles.scrollArea}>
        <div className={styles.contentWrapper}>
          {/* HEADER: ACTIVO E INSTRUMENTAL */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            <Card className={`${styles.assetCard} lg:col-span-3`}>
              <CardContent className="p-8 flex flex-col md:flex-row justify-between gap-8">
                <div className="flex items-start gap-6 text-left">
                  <div className="p-5 bg-slate-900 rounded-[1.5rem] text-white">
                    <Box size={36} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Activo Inspeccionado
                    </p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                      {testRun.asset?.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-500 font-bold"
                    >
                      OT: {testRun.workOrder?.code}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[240px] text-left border-l border-slate-100 pl-6 text-slate-600">
                  <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg">
                    <span className="text-[10px] font-black uppercase text-blue-600">
                      Configuración
                    </span>
                    <span className="text-xs font-black">
                      {fases.length} Fases / {numConductores} Hilos
                    </span>
                  </div>
                  {testRun.asset?.specs &&
                    Object.entries(testRun.asset.specs).map(([key, value]) => (
                      <div key={key} className={styles.specItem}>
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          {key}
                        </span>
                        <span className="text-[11px] font-black text-slate-700">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className={styles.equipmentCard}>
              <CardHeader className="pb-2 text-left">
                <CardTitle className="text-[10px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-2">
                  <Wrench size={14} /> Instrumentación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {linkedEquipments.map((entry) => (
                  <div key={entry.id} className={styles.equipmentItem}>
                    <p className="text-[11px] font-black leading-tight text-white">
                      {entry.equipment?.name}
                    </p>
                    <p className="text-[9px] font-bold text-blue-300 uppercase opacity-70">
                      S/N: {entry.equipment?.serialNumber}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* CUERPO: SECCIONES DE DATOS DINÁMICOS */}
          <div className="space-y-12">
            {sections.map((section) => {
              const sTitle = normalizeText(section.title);
              // Lógica de detección de matriz (igual que en el form)
              const isTechnicalMatrix =
                (sTitle.includes("medicion") ||
                  sTitle.includes("vlf") ||
                  sTitle.includes("aislamiento") ||
                  sTitle.includes("evidencia")) &&
                !sTitle.includes("ubicacion");

              return (
                <div key={section.id} className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Layers size={18} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                        {section.title}
                      </h3>
                    </div>
                    {isTechnicalMatrix && (
                      <Badge className="bg-slate-100 text-slate-500 border-none font-black uppercase text-[9px]">
                        {fases.length} Fases × {numConductores} Hilos
                      </Badge>
                    )}
                  </div>

                  {isTechnicalMatrix ? (
                    /* --- RENDER MATRIZ TÉCNICA --- */
                    <Card className="overflow-hidden border-slate-200 rounded-[2rem] shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase border-r w-48">
                                Parámetro
                              </th>
                              {fases.map((f) => (
                                <th
                                  key={f}
                                  colSpan={numConductores}
                                  className="p-4 text-center text-[11px] font-black text-slate-800 uppercase border-r bg-blue-50/30"
                                >
                                  Fase {f}
                                </th>
                              ))}
                            </tr>
                            <tr className="bg-slate-50/50 border-b">
                              <th className="border-r"></th>
                              {fases.map((f) =>
                                Array.from({ length: numConductores }).map(
                                  (_, i) => (
                                    <th
                                      key={`${f}-h${i}`}
                                      className="p-2 text-[9px] font-bold text-slate-400 uppercase border-r text-center"
                                    >
                                      H{i + 1}
                                    </th>
                                  ),
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {section.fields.map((field) => (
                              <tr
                                key={field.id}
                                className="border-b hover:bg-slate-50 transition-colors"
                              >
                                {/* 🟢 COLUMNA DE PARÁMETRO ACTUALIZADA CON UNIDADES */}
                                <td className="p-5 border-r bg-slate-50/20 font-black text-[11px] text-slate-700 uppercase">
                                  <div className="flex flex-col gap-0.5">
                                    <span>{field.label}</span>
                                    {field.unit && (
                                      <span className="text-[9px] font-bold text-blue-500 lowercase tracking-wider">
                                        ({field.unit})
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* RENDERIZADO DE CELDAS DE VALORES (A, B, C / H1, H2...) */}
                                {fases.map((f) =>
                                  Array.from({ length: numConductores }).map(
                                    (_, i) => {
                                      const storageKey = `${field.id}_${f.toLowerCase()}_c${i + 1}`;
                                      const value =
                                        capturedData[section.id]?.[storageKey];
                                      const isPhoto =
                                        field.type === "camera" ||
                                        field.type === "image";

                                      return (
                                        <td
                                          key={storageKey}
                                          className="p-3 border-r text-center"
                                        >
                                          {isPhoto ? (
                                            value ? (
                                              <div className="flex justify-center">
                                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-green-500 shadow-sm">
                                                  <Image
                                                    src={String(value)}
                                                    alt="Evidencia"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-slate-300 italic">
                                                N/A
                                              </span>
                                            )
                                          ) : (
                                            <span className="text-sm font-black text-slate-800">
                                              {/* Aquí mostramos solo el número, ya que la unidad está en la cabecera lateral */}
                                              {value ? String(value) : "---"}
                                            </span>
                                          )}
                                        </td>
                                      );
                                    },
                                  ),
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : (
                    /* --- RENDER DATOS GENERALES (UBICACIÓN, ETC) --- */
                    <div className={styles.dataGrid}>
                      {section.fields.map((field) => {
                        const value = capturedData[section.id]?.[field.id];
                        return (
                          <Card key={field.id} className={styles.dataCard}>
                            <CardContent className="p-6 flex flex-col gap-2 text-left">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {field.label}
                              </span>
                              <p className="text-base font-black text-slate-800 tracking-tight">
                                {value ? (
                                  String(value)
                                ) : (
                                  <span className="text-slate-300 italic">
                                    No registrado
                                  </span>
                                )}
                                {value && field.unit && (
                                  <span className="ml-1 text-blue-500 text-xs">
                                    {field.unit}
                                  </span>
                                )}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER: SECCIÓN DE FIRMAS */}
          <div className="mt-20 space-y-8 pb-20">
            <div className="flex items-center gap-3 px-2">
              <PenTool size={22} className="text-blue-600" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">
                Validación y Firmas
              </h3>
            </div>
            <div className={styles.signatureGrid}>
              <div className={styles.signatureCard}>
                <div className="h-32 w-full border-b border-slate-100 flex items-center justify-center text-slate-200 font-black uppercase text-[10px]">
                  Firma Digitalizada Técnico
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs font-black text-slate-800 uppercase leading-none mb-2">
                    Ingeniero Ejecutor
                  </p>
                  <div className={styles.timestamp}>
                    <Clock size={12} />{" "}
                    {new Date(testRun.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className={styles.signatureCard}>
                <div className="relative h-32 w-full border-b border-slate-100 flex items-center justify-center overflow-hidden">
                  {testRun.status === "APPROVED" && reviewInfo?.signature ? (
                    <Image
                      src={reviewInfo.signature}
                      alt="Firma Supervisor"
                      fill
                      className="object-contain mix-blend-multiply p-4"
                      unoptimized
                    />
                  ) : (
                    <span className="italic text-slate-200 text-xs font-black uppercase">
                      Pendiente de Revisión
                    </span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs font-black text-slate-800 uppercase leading-none mb-2">
                    Aprobación Interventoría
                  </p>
                  {reviewInfo?.reviewedAt && (
                    <div className={styles.timestamp}>
                      <Clock size={12} />{" "}
                      {new Date(reviewInfo.reviewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
