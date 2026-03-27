"use client";

import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Alias para coherencia visual en exportación PDF.
const FilePdf = FileText;

import type { Vacancy } from "@/types/vacancy";
import type { VacancyEstado } from "@/types/vacancy";
import type { VacancySede } from "@/types/vacancy";
import {
  aggregateVacanciesByArea,
  computeVacancyKpis,
} from "@/lib/vacancy-metrics";
import type { Candidate } from "@/types/candidate";
import type { VacancyCandidate } from "@/data/mock-vacancy-candidates";
import { loadPersistedCandidates } from "@/lib/persisted-candidates";
import { NewVacancyDialog } from "@/components/vacancies/new-vacancy-dialog";
import { VacanciesByAreaChart } from "@/components/vacancies/vacancies-by-area-chart";
import { VacanciesKpiCards } from "@/components/vacancies/vacancies-kpi-cards";
import { VacanciesTable } from "@/components/vacancies/vacancies-table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadPersistedVacancies,
  persistVacancies,
} from "@/lib/persisted-vacancies";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(d);
}

function buildCandidatesByVacancyId(
  candidates: Candidate[]
): Record<string, VacancyCandidate[]> {
  return candidates.reduce<Record<string, VacancyCandidate[]>>((acc, c) => {
    const item: VacancyCandidate = { nombre: c.nombre, etapa: c.etapa };
    (acc[c.vacancyId] ??= []).push(item);
    return acc;
  }, {});
}

export function VacanciesModule({
  initialVacancies,
}: {
  initialVacancies: Vacancy[];
}) {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [vacanciesHydrated, setVacanciesHydrated] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sedeFilter, setSedeFilter] = useState<VacancySede | "todas">("todas");
  const [estadoFilter, setEstadoFilter] = useState<VacancyEstado | "todas">("todas");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const persisted = loadPersistedVacancies();
    if (persisted && persisted.length > 0) setVacancies(persisted);
    setVacanciesHydrated(true);
  }, []);

  useEffect(() => {
    const persisted = loadPersistedCandidates();
    if (persisted && persisted.length > 0) setCandidates(persisted);
  }, []);

  useEffect(() => {
    // Regla automática: si una vacante tiene al menos un candidato "Contratado",
    // entonces esa vacante pasa a estado "contratado".
    const vacancyIdsWithContratado = new Set(
      candidates.filter((c) => c.etapa === "Contratado").map((c) => c.vacancyId)
    );
    if (vacancyIdsWithContratado.size === 0) return;

    setVacancies((prev) => {
      let changed = false;
      const next = prev.map((v) => {
        if (!vacancyIdsWithContratado.has(v.id)) return v;
        if (v.estado === "contratado") return v;
        changed = true;
        return { ...v, estado: "contratado" as VacancyEstado };
      });
      return changed ? next : prev;
    });
  }, [candidates]);

  useEffect(() => {
    if (!vacanciesHydrated) return;
    persistVacancies(vacancies);
  }, [vacancies, vacanciesHydrated]);

  const kpis = useMemo(() => computeVacancyKpis(vacancies), [vacancies]);
  const byArea = useMemo(
    () => aggregateVacanciesByArea(vacancies),
    [vacancies]
  );

  const candidatesByVacancyId = useMemo(() => {
    return buildCandidatesByVacancyId(candidates);
  }, [candidates]);

  const sortedVacancies = useMemo(() => {
    return [...vacancies].sort((a, b) => {
      const aTs = new Date(a.updatedAt ?? a.createdAt ?? a.fechaSolicitud).getTime();
      const bTs = new Date(b.updatedAt ?? b.createdAt ?? b.fechaSolicitud).getTime();
      return bTs - aTs;
    });
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    return sortedVacancies.filter((v) => {
      if (sedeFilter !== "todas" && v.sede !== sedeFilter) return false;
      if (estadoFilter !== "todas" && v.estado !== estadoFilter) return false;
      return true;
    });
  }, [sortedVacancies, sedeFilter, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVacancies.length / pageSize));
  const pagedVacancies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVacancies.slice(start, start + pageSize);
  }, [filteredVacancies, page]);

  const exportRows = useMemo(() => {
    return filteredVacancies.map((v) => ({
      "ID VACANTE": v.id,
      CARGO: v.cargo,
      "ÁREA": v.area,
      "SEDE": v.sede === "Campamento" ? "Planta SYCP" : v.sede,
      PRIORIDAD: v.prioridad,
      "FECHA SOLICITUD": formatDate(v.fechaSolicitud),
      ESTADO: v.estado,
      "JEFE SOLICITANTE": v.jefeSolicitante ?? "—",
      MONEDA: v.moneda ?? "—",
      "SUELDO OBJETIVO": v.sueldoObjetivo ?? "—",
      "BANDA MIN": v.bandaMin ?? "—",
      "BANDA MAX": v.bandaMax ?? "—",
      "FECHA OBJETIVO CIERRE": v.fechaObjetivoCierre ? formatDate(v.fechaObjetivoCierre) : "—",
      "FECHA CIERRE": v.fechaCierre ? formatDate(v.fechaCierre) : "—",
      "FECHA CREACIÓN": v.createdAt ? new Date(v.createdAt).toLocaleString("es-PE") : "—",
      "FECHA ACTUALIZACIÓN": v.updatedAt ? new Date(v.updatedAt).toLocaleString("es-PE") : "—",
    }));
  }, [filteredVacancies]);

  const exportVacanciesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vacantes");
    const dateTag = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `reporte_vacantes_${dateTag}.xlsx`);
  };

  const exportVacanciesPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const now = new Date();
    doc.setFontSize(13);
    doc.text("Reporte de Vacantes - TalentTrack", 14, 14);
    doc.setFontSize(10);
    doc.text(`Fecha: ${now.toLocaleString("es-PE")}`, 14, 20);

    const headers = Object.keys(exportRows[0] ?? { "SIN DATOS": "" });
    const body = exportRows.length
      ? exportRows.map((row) =>
          headers.map((h) => String((row as Record<string, unknown>)[h] ?? ""))
        )
      : [["No hay registros para exportar"]];

    autoTable(doc, {
      startY: 26,
      head: [headers],
      body,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [15, 39, 68] },
    });

    const dateTag = now.toISOString().slice(0, 10);
    doc.save(`reporte_vacantes_${dateTag}.pdf`);
  };

  useEffect(() => {
    setPage(1);
  }, [sedeFilter, estadoFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vacantes</h1>
          <p className="mt-1 text-sm text-slate-600">
            KPIs, distribución por área y seguimiento de SLA por fecha de
            solicitud.
          </p>
        </div>
        <NewVacancyDialog
          onCreated={(v) =>
            setVacancies((prev) => {
              const nowIso = new Date().toISOString();
              return [{ ...v, createdAt: v.createdAt ?? nowIso, updatedAt: nowIso }, ...prev];
            })
          }
        />
      </div>

      <div className="mt-8 space-y-6">
        <VacanciesKpiCards kpis={kpis} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Sede</Label>
              <Select
                value={sedeFilter}
                onValueChange={(v) => setSedeFilter(v as VacancySede | "todas")}
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Todas las sedes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las sedes</SelectItem>
                  <SelectItem value="Sechura">Sechura</SelectItem>
                  <SelectItem value="Paita">Paita</SelectItem>
                  <SelectItem value="Lima">Lima</SelectItem>
                  <SelectItem value="Campamento">Planta SYCP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado de la vacante</Label>
              <Select
                value={estadoFilter}
                onValueChange={(v) => setEstadoFilter(v as VacancyEstado | "todas")}
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los estados</SelectItem>
                  <SelectItem value="abierta">Abierta</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="contratado">Contratado</SelectItem>
                  <SelectItem value="cubierta">Cubierta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg"
                onClick={() => {
                  setSedeFilter("todas");
                  setEstadoFilter("todas");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={exportVacanciesExcel}
              disabled={exportRows.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={exportVacanciesPdf}
              disabled={exportRows.length === 0}
            >
              <FilePdf className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
          <div className="order-2 min-w-0 flex-1 xl:order-1">
            <VacanciesTable
              vacancies={pagedVacancies}
              candidatesByVacancyId={candidatesByVacancyId}
              onVacancyUpdate={(id, patch) =>
                setVacancies((prev) =>
                  prev.map((v) =>
                    v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v
                  )
                )
              }
              onVacancyDelete={(id) =>
                setVacancies((prev) => prev.filter((v) => v.id !== id))
              }
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
          <div className="order-1 w-full shrink-0 xl:order-2 xl:w-[400px]">
            <VacanciesByAreaChart data={byArea} />
          </div>
        </div>
      </div>
    </div>
  );
}
