"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Shuffle,
  X,
} from "lucide-react";

// Alias para mantener coherencia del requerimiento de UI para PDF.
const FilePdf = FileText;
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  Candidate,
  CandidateEstadoEstudios,
  CandidateGradoAcademico,
  CandidateSede,
  CandidateStage,
} from "@/types/candidate";
import {
  CANDIDATE_ESTADOS_ESTUDIOS,
  CANDIDATE_GRADOS_ACADEMICOS,
  CANDIDATE_SEDES,
  CANDIDATE_STAGES,
} from "@/types/candidate";
import type { Vacancy, VacancyCurrency, VacancyPriority } from "@/types/vacancy";
import { VACANCY_SEDES } from "@/types/vacancy";
import type { CandidateCvProfile } from "@/data/mock-candidate-profiles";
import { mockCandidateCvProfiles } from "@/data/mock-candidate-profiles";
import { getBudgetStatus } from "@/lib/candidate-budget";
import { supabase } from "@/lib/supabase";
import { mapCandidateRow, mapVacancyRow } from "@/lib/supabase-mappers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatMoney(amount: number, currency: VacancyCurrency): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMoneyMaybe(amount: number | undefined, currency: VacancyCurrency) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return formatMoney(amount, currency);
}

function vacancyById(vacancies: Vacancy[], id: string): Vacancy | undefined {
  return vacancies.find((v) => v.id === id);
}

export function CandidatesScreen({
  initialCandidates,
  vacancies,
}: {
  initialCandidates: Candidate[];
  vacancies: Vacancy[];
}) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [vacanciesState, setVacanciesState] = useState<Vacancy[]>(vacancies);
  const [sedeFilter, setSedeFilter] = useState<CandidateSede | "todas">(
    "todas"
  );
  const [etapaFilter, setEtapaFilter] = useState<CandidateStage | "todas">(
    "todas"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [draftEdit, setDraftEdit] = useState<{
    nombre: string;
    dni: string;
    celular: string;
    correo: string;
    sede: CandidateSede;
    vacancyId: string;
    etapa: CandidateStage;
    expectativaSalarial: string;
    moneda: VacancyCurrency;
    gradoAcademico: CandidateGradoAcademico;
    estadoEstudios: CandidateEstadoEstudios;
    carreraEspecialidad: string;
    aniosExperiencia: string;
    ultimoCargo: string;
    observaciones: string;
  } | null>(null);

  const [newCandidateOpen, setNewCandidateOpen] = useState(false);
  const [draftNew, setDraftNew] = useState<{
    nombre: string;
    dni: string;
    celular: string;
    correo: string;
    sede: CandidateSede;
    vacancyId: string;
    etapa: CandidateStage;
    expectativaSalarial: string;
    moneda: VacancyCurrency;
    gradoAcademico: CandidateGradoAcademico;
    estadoEstudios: CandidateEstadoEstudios;
    carreraEspecialidad: string;
    aniosExperiencia: string;
    ultimoCargo: string;
    observaciones: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [vRes, cRes] = await Promise.all([
        supabase.from("vacantes").select("*"),
        supabase.from("candidatos").select("*"),
      ]);

      if (cancelled) return;

      if (vRes.error) {
        console.error("Supabase vacantes:", vRes.error);
      } else if (vRes.data != null) {
        setVacanciesState(vRes.data.map((row) => mapVacancyRow(row as Record<string, unknown>)));
      }

      if (cRes.error) {
        console.error("Supabase candidatos:", cRes.error);
      } else if (cRes.data != null) {
        setCandidates(cRes.data.map((row) => mapCandidateRow(row as Record<string, unknown>)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeVacancies = useMemo(() => {
    return vacanciesState.filter(
      (v) => v.estado === "abierta" || v.estado === "pausada"
    );
  }, [vacanciesState]);

  const filtered = useMemo(() => {
    const base = candidates.filter((c) => {
      if (sedeFilter !== "todas" && c.sede !== sedeFilter) return false;
      if (etapaFilter !== "todas" && c.etapa !== etapaFilter) return false;
      return true;
    });
    return [...base].sort((a, b) => {
      const aTs = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTs = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTs - aTs;
    });
  }, [candidates, sedeFilter, etapaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [sedeFilter, etapaFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidates.find((c) => c.id === selectedCandidateId) ?? null;
  }, [candidates, selectedCandidateId]);

  const selectedVacancy = useMemo(() => {
    if (!selectedCandidate) return undefined;
    return vacancyById(vacanciesState, selectedCandidate.vacancyId);
  }, [selectedCandidate, vacanciesState]);

  const selectedBudget = useMemo(() => {
    if (!selectedCandidate) return null;
    return getBudgetStatus(selectedCandidate.expectativaSalarial, selectedVacancy);
  }, [selectedCandidate, selectedVacancy]);

  const openEditForSelected = () => {
    if (!selectedCandidate || !selectedVacancy) return;
    setDraftEdit({
      nombre: selectedCandidate.nombre,
      dni: selectedCandidate.dni,
      celular: selectedCandidate.celular,
      correo: selectedCandidate.correo,
      sede: selectedCandidate.sede,
      vacancyId: selectedCandidate.vacancyId,
      etapa: selectedCandidate.etapa,
      expectativaSalarial: String(selectedCandidate.expectativaSalarial),
      moneda: selectedCandidate.moneda,
      gradoAcademico: selectedCandidate.gradoAcademico,
      estadoEstudios: selectedCandidate.estadoEstudios,
      carreraEspecialidad: selectedCandidate.carreraEspecialidad,
      aniosExperiencia: String(selectedCandidate.aniosExperiencia),
      ultimoCargo: selectedCandidate.ultimoCargo,
      observaciones: selectedCandidate.observaciones,
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraftEdit(null);
  };

  const saveEdit = async () => {
    if (!selectedCandidate || !draftEdit) return;
    const n = Number(draftEdit.expectativaSalarial);
    const a = Number(draftEdit.aniosExperiencia);
    if (
      !draftEdit.nombre.trim() ||
      !draftEdit.dni.trim() ||
      !draftEdit.celular.trim() ||
      !draftEdit.correo.trim() ||
      !draftEdit.vacancyId ||
      !Number.isFinite(n) ||
      !Number.isFinite(a) ||
      !draftEdit.carreraEspecialidad.trim() ||
      !draftEdit.ultimoCargo.trim() ||
      !draftEdit.gradoAcademico ||
      !draftEdit.estadoEstudios
    )
      return;

    try {
      const { data, error } = await supabase
        .from("candidatos")
        .update({
          nombre_completo: draftEdit.nombre.trim(),
          dni: draftEdit.dni.trim(),
          celular: draftEdit.celular.trim(),
          correo: draftEdit.correo.trim(),
          sede: draftEdit.sede,
          vacante_id: draftEdit.vacancyId,
          etapa: draftEdit.etapa,
          expectativa_salarial: n,
          moneda: draftEdit.moneda,
          grado_academico: draftEdit.gradoAcademico,
          estado_estudios: draftEdit.estadoEstudios,
          carrera: draftEdit.carreraEspecialidad.trim(),
          anios_experiencia: a,
          ultimo_cargo: draftEdit.ultimoCargo.trim(),
          observaciones: draftEdit.observaciones.trim(),
        })
        .eq("id", selectedCandidate.id)
        .select()
        .single();

      if (error) {
        alert(`No se pudo actualizar el candidato: ${error.message}`);
        return;
      }

      if (data) {
        const mapped = mapCandidateRow(data as Record<string, unknown>);
        setCandidates((prev) => prev.map((c) => (c.id === selectedCandidate.id ? mapped : c)));
      }
      setEditMode(false);
      setDraftEdit(null);
    } catch (err) {
      console.error(err);
      alert("Error inesperado al actualizar el candidato.");
    }
  };

  const vacancyOptionsForSelection = (currentVacancyId?: string) => {
    const current = currentVacancyId
      ? vacancyById(vacanciesState, currentVacancyId)
      : undefined;
    const activeIds = new Set(activeVacancies.map((v) => v.id));

    const options = [...activeVacancies];
    if (current && !activeIds.has(current.id)) {
      // Mantenemos la vacante actual aunque no sea activa, pero deshabilitada.
      options.push(current);
    }
    return options;
  };

  const openNewCandidate = () => {
    const fallbackVacancy = activeVacancies[0];
    if (!fallbackVacancy) return;
    setDraftNew({
      nombre: "",
      dni: "",
      celular: "",
      correo: "",
      sede: "Lima",
      vacancyId: fallbackVacancy.id,
      etapa: CANDIDATE_STAGES[0],
      expectativaSalarial: "",
      moneda: fallbackVacancy.moneda ?? "PEN",
      gradoAcademico: CANDIDATE_GRADOS_ACADEMICOS[0],
      estadoEstudios: CANDIDATE_ESTADOS_ESTUDIOS[0],
      carreraEspecialidad: "",
      aniosExperiencia: "0",
      ultimoCargo: "",
      observaciones: "",
    });
    setNewCandidateOpen(true);
  };

  useEffect(() => {
    if (newCandidateOpen) return;
    setDraftNew(null);
  }, [newCandidateOpen]);

  const saveNew = async () => {
    if (!draftNew) return;
    const n = Number(draftNew.expectativaSalarial);
    const a = Number(draftNew.aniosExperiencia);
    if (
      !draftNew.nombre.trim() ||
      !draftNew.dni.trim() ||
      !draftNew.celular.trim() ||
      !draftNew.correo.trim() ||
      !draftNew.vacancyId ||
      !Number.isFinite(n) ||
      !Number.isFinite(a) ||
      !draftNew.carreraEspecialidad.trim() ||
      !draftNew.ultimoCargo.trim() ||
      !draftNew.gradoAcademico ||
      !draftNew.estadoEstudios
    )
      return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `cand-${Date.now()}`;

    const payload = {
      id,
      nombre_completo: draftNew.nombre.trim(),
      dni: draftNew.dni.trim(),
      celular: draftNew.celular.trim(),
      correo: draftNew.correo.trim(),
      sede: draftNew.sede,
      vacante_id: draftNew.vacancyId,
      etapa: draftNew.etapa,
      expectativa_salarial: n,
      moneda: draftNew.moneda,
      grado_academico: draftNew.gradoAcademico,
      estado_estudios: draftNew.estadoEstudios,
      carrera: draftNew.carreraEspecialidad.trim(),
      anios_experiencia: a,
      ultimo_cargo: draftNew.ultimoCargo.trim(),
      observaciones: draftNew.observaciones.trim(),
    };

    try {
      const { data, error } = await supabase
        .from("candidatos")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Error Supabase:", error);
        alert(`No se pudo guardar el candidato: ${error.message}`);
        return;
      }

      if (data) {
        setCandidates((prev) => [mapCandidateRow(data as Record<string, unknown>), ...prev]);
        setNewCandidateOpen(false);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado al guardar el candidato.");
    }
  };

  // Modales existentes para CV / entrevista / mover etapa
  const [stageDialogId, setStageDialogId] = useState<string | null>(null);
  const [draftEtapa, setDraftEtapa] = useState<CandidateStage>(CANDIDATE_STAGES[0]);
  const editingCandidate =
    stageDialogId == null ? null : candidates.find((c) => c.id === stageDialogId) ?? null;

  const confirmStageMove = async () => {
    if (!stageDialogId) return;
    try {
      const { data, error } = await supabase
        .from("candidatos")
        .update({ etapa: draftEtapa })
        .eq("id", stageDialogId)
        .select()
        .single();

      if (error) {
        alert(`No se pudo actualizar la etapa: ${error.message}`);
        return;
      }

      if (data) {
        const mapped = mapCandidateRow(data as Record<string, unknown>);
        setCandidates((prev) => prev.map((c) => (c.id === stageDialogId ? mapped : c)));
      }
      setStageDialogId(null);
    } catch (err) {
      console.error(err);
      alert("Error inesperado al actualizar la etapa.");
    }
  };

  const [cvDialogId, setCvDialogId] = useState<string | null>(null);
  const cvCandidate =
    cvDialogId == null ? null : candidates.find((c) => c.id === cvDialogId) ?? null;
  const cvProfile = cvCandidate ? mockCandidateCvProfiles[cvCandidate.id] : undefined;

  const [interviewDialogId, setInterviewDialogId] = useState<string | null>(null);
  const interviewCandidate =
    interviewDialogId == null
      ? null
      : candidates.find((c) => c.id === interviewDialogId) ?? null;
  const [interviewFecha, setInterviewFecha] = useState("");
  const [interviewHora, setInterviewHora] = useState("");
  const [interviewNotas, setInterviewNotas] = useState("");
  const [interviewSuccess, setInterviewSuccess] = useState(false);

  useEffect(() => {
    if (interviewDialogId) {
      setInterviewFecha("");
      setInterviewHora("");
      setInterviewNotas("");
      setInterviewSuccess(false);
    }
  }, [interviewDialogId]);

  const confirmInterview = () => {
    if (!interviewFecha.trim() || !interviewHora.trim()) return;
    setInterviewSuccess(true);
  };

  const textareaClassName =
    "min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

  const exportRows = useMemo(() => {
    return filtered.map((c) => {
      const vac = vacancyById(vacanciesState, c.vacancyId);
      return {
        "NOMBRE COMPLETO": c.nombre,
        DNI: c.dni,
        CELULAR: c.celular,
        CORREO: c.correo,
        SEDE: c.sede,
        VACANTE: vac?.cargo ?? "—",
        "ESTADO ACTUAL": c.etapa,
        "EXPECTATIVA SALARIAL": formatMoney(c.expectativaSalarial, c.moneda),
        MONEDA: c.moneda,
        "GRADO ACADÉMICO": c.gradoAcademico,
        "ESTADO DE ESTUDIOS": c.estadoEstudios,
        "CARRERA / ESPECIALIDAD": c.carreraEspecialidad,
        "AÑOS DE EXPERIENCIA": c.aniosExperiencia,
        "ÚLTIMO CARGO": c.ultimoCargo,
        OBSERVACIONES: c.observaciones || "—",
        "FECHA CREACIÓN": c.createdAt ? new Date(c.createdAt).toLocaleString("es-PE") : "—",
        "FECHA ACTUALIZACIÓN": c.updatedAt ? new Date(c.updatedAt).toLocaleString("es-PE") : "—",
      };
    });
  }, [filtered, vacanciesState]);

  const exportCandidatesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatos");
    const dateTag = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `reporte_candidatos_${dateTag}.xlsx`);
  };

  const exportCandidatesPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const now = new Date();
    doc.setFontSize(13);
    doc.text("Reporte de Candidatos - TalentTrack", 14, 14);
    doc.setFontSize(10);
    doc.text(`Fecha: ${now.toLocaleString("es-PE")}`, 14, 20);

    const headers = Object.keys(exportRows[0] ?? { "SIN DATOS": "" });
    const body = exportRows.length
      ? exportRows.map((row) => headers.map((h) => String((row as Record<string, unknown>)[h] ?? "")))
      : [["No hay registros para exportar"]];

    autoTable(doc, {
      startY: 26,
      head: [headers],
      body,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [15, 39, 68] },
    });

    const dateTag = now.toISOString().slice(0, 10);
    doc.save(`reporte_candidatos_${dateTag}.pdf`);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Candidatos</h1>
          <p className="text-sm text-slate-600">
            Pipeline de postulantes: sede, vacante, etapa y control de expectativa frente a la banda salarial de la vacante.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={openNewCandidate}
            disabled={activeVacancies.length === 0}
          >
            Nuevo Candidato
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <Label className="text-slate-700">Sede</Label>
          <Select
            value={sedeFilter}
            onValueChange={(v) => setSedeFilter(v as CandidateSede | "todas")}
          >
            <SelectTrigger className="h-10 w-[280px] rounded-lg">
              <SelectValue placeholder="Todas las sedes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las sedes</SelectItem>
              {CANDIDATE_SEDES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Etapa</Label>
          <Select
            value={etapaFilter}
            onValueChange={(v) => setEtapaFilter(v as CandidateStage | "todas")}
          >
            <SelectTrigger className="h-10 w-[280px] rounded-lg">
              <SelectValue placeholder="Todas las etapas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las etapas</SelectItem>
              {CANDIDATE_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Button type="button" variant="outline" className="rounded-lg" onClick={exportCandidatesExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button type="button" variant="outline" className="rounded-lg" onClick={exportCandidatesPdf}>
            <FilePdf className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nombre</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead className="min-w-[160px]">Vacante a la que postula</TableHead>
              <TableHead className="min-w-[150px]">Etapa Actual</TableHead>
              <TableHead>Expectativa Salarial</TableHead>
              <TableHead className="min-w-[190px]">Presupuesto</TableHead>
              <TableHead className="min-w-[260px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.map((c) => {
              const vac = vacancyById(vacanciesState, c.vacancyId);
              const budget = getBudgetStatus(c.expectativaSalarial, vac);
              return (
                <TableRow
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-slate-50/80"
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setEditMode(false);
                    setDraftEdit(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCandidateId(c.id);
                      setEditMode(false);
                      setDraftEdit(null);
                    }
                  }}
                >
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="text-slate-600">{c.sede}</TableCell>
                  <TableCell className="text-slate-700">{vac?.cargo ?? "—"}</TableCell>
                  <TableCell className="text-slate-700">{c.etapa}</TableCell>
                  <TableCell className="text-slate-700 whitespace-nowrap tabular-nums">
                    {formatMoney(c.expectativaSalarial, c.moneda)}
                  </TableCell>
                  <TableCell>
                    {budget === "excede" && (
                      <Badge variant="danger" className="font-normal">
                        ⚠️ Excede Presupuesto
                      </Badge>
                    )}
                    {budget === "en_banda" && (
                      <Badge variant="success" className="font-normal">
                        ✅ En Banda
                      </Badge>
                    )}
                    {budget === "sin_banda" && (
                      <Badge variant="secondary" className="font-normal">
                        Sin banda en vacante
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCvDialogId(c.id);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Ver CV
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterviewDialogId(c.id);
                        }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Programar Entrevista
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftEtapa(c.etapa);
                          setStageDialogId(c.id);
                        }}
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        Mover de Etapa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="p-6">
            <p className="text-sm text-slate-500">No hay candidatos con los filtros seleccionados.</p>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Sheet: detalle + edición */}
      <Sheet
        open={selectedCandidateId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedCandidateId(null);
            setEditMode(false);
            setDraftEdit(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="bg-[#0f2744] px-6 py-4">
            <SheetTitle className="text-white">
              {selectedCandidate ? selectedCandidate.nombre : "Candidato"}
            </SheetTitle>
            <SheetDescription className="text-white/80">
              {editMode ? "Editar información del candidato" : "Vista completa del candidato"}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-5">
            {!selectedCandidate ? null : !editMode ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Nombre Completo
                    </p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.nombre}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      DNI
                    </p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.dni}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Celular
                    </p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.celular}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Correo
                    </p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.correo}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sede
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.sede}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Expectativa Salarial
                    </p>
                    <p className="text-sm text-slate-900 whitespace-nowrap tabular-nums">
                      {formatMoneyMaybe(selectedCandidate.expectativaSalarial, selectedCandidate.moneda)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Vacante a la que postula
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedVacancy?.cargo ?? "—"}
                      {selectedVacancy ? ` · ${selectedVacancy.area} · ${selectedVacancy.sede}` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Etapa Actual
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.etapa}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Grado Académico
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.gradoAcademico}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Estado de Estudios
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.estadoEstudios}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Años de Experiencia
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.aniosExperiencia}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Carrera / Especialidad
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.carreraEspecialidad}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Último Cargo
                    </p>
                    <p className="text-sm text-slate-900">{selectedCandidate.ultimoCargo}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Semáforo de presupuesto
                    </p>
                    <div className="mt-2">
                      {selectedBudget === "excede" && (
                        <Badge variant="danger" className="font-normal">⚠️ Excede Presupuesto</Badge>
                      )}
                      {selectedBudget === "en_banda" && (
                        <Badge variant="success" className="font-normal">✅ En Banda</Badge>
                      )}
                      {selectedBudget === "sin_banda" && (
                        <Badge variant="secondary" className="font-normal">Sin banda en vacante</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-5">
                  <h4 className="text-sm font-bold uppercase text-slate-500">Observaciones</h4>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-slate-700 italic">
                    {selectedCandidate.observaciones?.trim() ? selectedCandidate.observaciones : "—"}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={openEditForSelected}
                  >
                    Editar
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="rounded-lg">
                      Cerrar
                    </Button>
                  </SheetClose>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-cand-nombre">Nombre Completo</Label>
                      <Input
                        id="edit-cand-nombre"
                        value={draftEdit?.nombre ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) => (d ? { ...d, nombre: e.target.value } : d))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-cand-dni">DNI</Label>
                      <Input
                        id="edit-cand-dni"
                        value={draftEdit?.dni ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) => (d ? { ...d, dni: e.target.value } : d))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-cand-celular">Celular</Label>
                      <Input
                        id="edit-cand-celular"
                        value={draftEdit?.celular ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) => (d ? { ...d, celular: e.target.value } : d))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-cand-correo">Correo</Label>
                      <Input
                        id="edit-cand-correo"
                        type="email"
                        value={draftEdit?.correo ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) => (d ? { ...d, correo: e.target.value } : d))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sede</Label>
                      <Select
                        value={draftEdit?.sede ?? "Lima"}
                        onValueChange={(v) =>
                          setDraftEdit((d) => (d ? { ...d, sede: v as CandidateSede } : d))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar sede" />
                        </SelectTrigger>
                        <SelectContent>
                          {CANDIDATE_SEDES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="edit-cand-vacante">Vacante a la que postula</Label>
                      <Select
                        value={draftEdit?.vacancyId ?? ""}
                        onValueChange={(val) => {
                          const vac = vacancyById(vacanciesState, val);
                          setDraftEdit((d) =>
                            d
                              ? {
                                  ...d,
                                  vacancyId: val,
                                  moneda: (vac?.moneda ?? d.moneda) as VacancyCurrency,
                                }
                              : d
                          );
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar vacante" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacancyOptionsForSelection(draftEdit?.vacancyId).map((v) => {
                            const isActive =
                              v.estado === "abierta" || v.estado === "pausada";
                            return (
                              <SelectItem
                                key={v.id}
                                value={v.id}
                                disabled={!isActive && v.id !== draftEdit?.vacancyId}
                              >
                                {v.cargo} · {v.area} · {v.sede}
                                {!isActive && v.id === draftEdit?.vacancyId ? " (actual)" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Etapa Actual</Label>
                      <Select
                        value={draftEdit?.etapa ?? CANDIDATE_STAGES[0]}
                        onValueChange={(val) =>
                          setDraftEdit((d) => (d ? { ...d, etapa: val as CandidateStage } : d))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar etapa" />
                        </SelectTrigger>
                        <SelectContent>
                          {CANDIDATE_STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Expectativa Salarial</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={draftEdit?.expectativaSalarial ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) =>
                            d ? { ...d, expectativaSalarial: e.target.value } : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Moneda</Label>
                      <Select
                        value={draftEdit?.moneda ?? "PEN"}
                        onValueChange={(val) =>
                          setDraftEdit((d) => (d ? { ...d, moneda: val as VacancyCurrency } : d))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEN">PEN</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Grado Académico</Label>
                      <Select
                        value={draftEdit?.gradoAcademico ?? CANDIDATE_GRADOS_ACADEMICOS[0]}
                        onValueChange={(val) =>
                          setDraftEdit((d) =>
                            d ? { ...d, gradoAcademico: val as CandidateGradoAcademico } : d
                          )
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {CANDIDATE_GRADOS_ACADEMICOS.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Estado de Estudios</Label>
                      <Select
                        value={draftEdit?.estadoEstudios ?? CANDIDATE_ESTADOS_ESTUDIOS[0]}
                        onValueChange={(val) =>
                          setDraftEdit((d) =>
                            d ? { ...d, estadoEstudios: val as CandidateEstadoEstudios } : d
                          )
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {CANDIDATE_ESTADOS_ESTUDIOS.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Años de Experiencia</Label>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={draftEdit?.aniosExperiencia ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) =>
                            d ? { ...d, aniosExperiencia: e.target.value } : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Carrera / Especialidad</Label>
                      <Input
                        value={draftEdit?.carreraEspecialidad ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) =>
                            d ? { ...d, carreraEspecialidad: e.target.value } : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Último Cargo</Label>
                      <Input
                        value={draftEdit?.ultimoCargo ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) =>
                            d ? { ...d, ultimoCargo: e.target.value } : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Observaciones</Label>
                      <textarea
                        className={textareaClassName}
                        value={draftEdit?.observaciones ?? ""}
                        onChange={(e) =>
                          setDraftEdit((d) =>
                            d ? { ...d, observaciones: e.target.value } : d
                          )
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="rounded-lg"
                      onClick={saveEdit}
                      disabled={
                        !draftEdit?.nombre.trim() ||
                        !draftEdit?.dni.trim() ||
                        !draftEdit?.celular.trim() ||
                        !draftEdit?.correo.trim() ||
                        !draftEdit?.vacancyId ||
                        !Number.isFinite(Number(draftEdit?.expectativaSalarial)) ||
                        !Number.isFinite(Number(draftEdit?.aniosExperiencia)) ||
                        !draftEdit?.carreraEspecialidad.trim() ||
                        !draftEdit?.ultimoCargo.trim() ||
                        !draftEdit?.gradoAcademico ||
                        !draftEdit?.estadoEstudios
                      }
                    >
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* X global en esquina derecha */}
          <SheetClose asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetClose>
        </SheetContent>
      </Sheet>

      {/* Dialog: Nuevo candidato */}
      <Dialog
        open={newCandidateOpen}
        onOpenChange={(next) => {
          if (!next) setNewCandidateOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Candidato</DialogTitle>
            <DialogDescription>
              Registra un nuevo candidato conectando la vacante seleccionada con las vacantes activas.
            </DialogDescription>
          </DialogHeader>

          {!draftNew ? null : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-cand-nombre">Nombre Completo</Label>
                  <Input
                    id="new-cand-nombre"
                    value={draftNew.nombre}
                    onChange={(e) =>
                      setDraftNew((d) => (d ? { ...d, nombre: e.target.value } : d))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-cand-dni">DNI</Label>
                  <Input
                    id="new-cand-dni"
                    value={draftNew.dni}
                    onChange={(e) =>
                      setDraftNew((d) => (d ? { ...d, dni: e.target.value } : d))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-cand-celular">Celular</Label>
                  <Input
                    id="new-cand-celular"
                    value={draftNew.celular}
                    onChange={(e) =>
                      setDraftNew((d) => (d ? { ...d, celular: e.target.value } : d))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-cand-correo">Correo</Label>
                  <Input
                    id="new-cand-correo"
                    type="email"
                    value={draftNew.correo}
                    onChange={(e) =>
                      setDraftNew((d) => (d ? { ...d, correo: e.target.value } : d))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sede</Label>
                  <Select
                    value={draftNew.sede}
                    onValueChange={(v) =>
                      setDraftNew((d) => (d ? { ...d, sede: v as CandidateSede } : d))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_SEDES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-cand-vacante">Vacante a la que postula</Label>
                  <Select
                    value={draftNew.vacancyId}
                    onValueChange={(val) => {
                      const vac = vacancyById(vacanciesState, val);
                      setDraftNew((d) =>
                        d
                          ? {
                              ...d,
                              vacancyId: val,
                              moneda: (vac?.moneda ?? d.moneda) as VacancyCurrency,
                            }
                          : d
                      );
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar vacante" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeVacancies.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.cargo} · {v.area} · {v.sede}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Etapa</Label>
                  <Select
                    value={draftNew.etapa}
                    onValueChange={(val) =>
                      setDraftNew((d) => (d ? { ...d, etapa: val as CandidateStage } : d))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expectativa Salarial</Label>
                  <Input
                    id="new-cand-exp"
                    type="number"
                    min={0}
                    step="0.01"
                    value={draftNew.expectativaSalarial}
                    onChange={(e) =>
                      setDraftNew((d) =>
                        d ? { ...d, expectativaSalarial: e.target.value } : d
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={draftNew.moneda}
                    onValueChange={(val) =>
                      setDraftNew((d) => (d ? { ...d, moneda: val as VacancyCurrency } : d))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grado Académico</Label>
                  <Select
                    value={draftNew.gradoAcademico}
                    onValueChange={(val) =>
                      setDraftNew((d) =>
                        d ? { ...d, gradoAcademico: val as CandidateGradoAcademico } : d
                      )
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_GRADOS_ACADEMICOS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado de Estudios</Label>
                  <Select
                    value={draftNew.estadoEstudios}
                    onValueChange={(val) =>
                      setDraftNew((d) =>
                        d ? { ...d, estadoEstudios: val as CandidateEstadoEstudios } : d
                      )
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_ESTADOS_ESTUDIOS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Carrera / Especialidad</Label>
                  <Input
                    value={draftNew.carreraEspecialidad}
                    onChange={(e) =>
                      setDraftNew((d) =>
                        d ? { ...d, carreraEspecialidad: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Años de Experiencia</Label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={draftNew.aniosExperiencia}
                    onChange={(e) =>
                      setDraftNew((d) =>
                        d ? { ...d, aniosExperiencia: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Último Cargo</Label>
                  <Input
                    value={draftNew.ultimoCargo}
                    onChange={(e) =>
                      setDraftNew((d) =>
                        d ? { ...d, ultimoCargo: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Observaciones</Label>
                  <textarea
                    className={textareaClassName}
                    value={draftNew.observaciones}
                    onChange={(e) =>
                      setDraftNew((d) => (d ? { ...d, observaciones: e.target.value } : d))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setNewCandidateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="rounded-lg"
                  onClick={saveNew}
                  disabled={
                    !draftNew.nombre.trim() ||
                    !draftNew.dni.trim() ||
                    !draftNew.celular.trim() ||
                    !draftNew.correo.trim() ||
                    !draftNew.vacancyId ||
                    !Number.isFinite(Number(draftNew.expectativaSalarial)) ||
                    !Number.isFinite(Number(draftNew.aniosExperiencia)) ||
                    !draftNew.carreraEspecialidad.trim() ||
                    !draftNew.ultimoCargo.trim() ||
                    !draftNew.gradoAcademico ||
                    !draftNew.estadoEstudios
                  }
                >
                  Guardar candidato
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Mover de etapa */}
      <Dialog
        open={stageDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setStageDialogId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mover de Etapa</DialogTitle>
          </DialogHeader>
          {editingCandidate && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600">
                Candidato:{" "}
                <span className="font-medium text-slate-900">{editingCandidate.nombre}</span>
              </p>
              <div className="space-y-2">
                <Label>Nueva etapa</Label>
                <Select
                  value={draftEtapa}
                  onValueChange={(v) => setDraftEtapa(v as CandidateStage)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setStageDialogId(null)}
            >
              Cancelar
            </Button>
            <Button type="button" className="rounded-lg" onClick={confirmStageMove}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: CV */}
      <Dialog
        open={cvDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setCvDialogId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left">
            <DialogTitle>Curriculum vitae</DialogTitle>
            {cvCandidate && (
              <DialogDescription>
                Vista previa del perfil de {cvCandidate.nombre}.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-5">
            {cvCandidate && cvProfile ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{cvCandidate.nombre}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Sede {cvCandidate.sede}
                    {" · "}
                    {vacancyById(vacanciesState, cvCandidate.vacancyId)?.cargo ?? "Vacante"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>{cvProfile.email}</span>
                    <span>{cvProfile.telefono}</span>
                  </div>
                </div>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resumen
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{cvProfile.resumen}</p>
                </section>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Experiencia
                  </h4>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-700">
                    {cvProfile.experiencia.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Educación
                  </h4>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-700">
                    {cvProfile.educacion.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : cvCandidate ? (
              <p className="text-sm text-slate-600">Aún no hay información de CV cargada para este candidato.</p>
            ) : null}
          </div>
          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setCvDialogId(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Programar entrevista */}
      <Dialog
        open={interviewDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setInterviewDialogId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Programar Entrevista</DialogTitle>
            {interviewCandidate && (
              <DialogDescription>
                Define fecha y hora para {interviewCandidate.nombre}.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="max-h-[calc(90vh-12rem)] overflow-y-auto">
            {interviewSuccess && interviewCandidate ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <p className="text-base font-medium text-slate-900">Entrevista registrada</p>
                <p className="text-sm text-slate-600">
                  {interviewCandidate.nombre}
                  <br />
                  <span className="text-slate-600">
                    {new Intl.DateTimeFormat("es-PE", {
                      dateStyle: "long",
                    }).format(new Date(interviewFecha + "T12:00:00"))} a las {interviewHora}
                  </span>
                </p>
                {interviewNotas.trim() ? (
                  <p className="text-left text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Notas:</span> {interviewNotas}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  La sincronización con calendario externo se añadirá en una siguiente iteración.
                </p>
              </div>
            ) : (
              interviewCandidate && (
                <div className="space-y-4 py-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="entrevista-fecha">Fecha</Label>
                      <Input
                        id="entrevista-fecha"
                        type="date"
                        value={interviewFecha}
                        onChange={(e) => setInterviewFecha(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entrevista-hora">Hora</Label>
                      <Input
                        id="entrevista-hora"
                        type="time"
                        value={interviewHora}
                        onChange={(e) => setInterviewHora(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrevista-notas">Notas (opcional)</Label>
                    <textarea
                      id="entrevista-notas"
                      className={textareaClassName}
                      placeholder="Ej. Entrevista con jefe directo, sala 2…"
                      value={interviewNotas}
                      onChange={(e) => setInterviewNotas(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            {interviewSuccess ? (
              <Button type="button" className="rounded-lg" onClick={() => setInterviewDialogId(null)}>
                Listo
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setInterviewDialogId(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="rounded-lg"
                  onClick={confirmInterview}
                  disabled={!interviewFecha.trim() || !interviewHora.trim()}
                >
                  Confirmar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

