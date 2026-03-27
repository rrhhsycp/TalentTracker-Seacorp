import { getDaysSinceRequest, getSlaStatus } from "@/lib/sla";
import type { Vacancy } from "@/types/vacancy";

export type VacancyKpis = {
  vacantesAbiertas: number;
  vacantesCubiertas: number;
  promedioCierreDias: number | null;
  cumplimientoSlaPct: number;
};

function daysBetween(startIso: string, endIso: string): number {
  const a = new Date(startIso + "T12:00:00");
  const b = new Date(endIso + "T12:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Vacante cumple SLA: abiertas/pausadas sin semáforo rojo; cubiertas cerradas en ≤15 días desde solicitud. */
function vacancyMeetsSla(v: Vacancy): boolean {
  if (v.estado === "abierta" || v.estado === "pausada") {
    const days = getDaysSinceRequest(new Date(v.fechaSolicitud + "T12:00:00"));
    return getSlaStatus(days) !== "red";
  }
  if (v.estado === "cubierta" && v.fechaCierre) {
    return daysBetween(v.fechaSolicitud, v.fechaCierre) <= 15;
  }
  return true;
}

export function computeVacancyKpis(vacancies: Vacancy[]): VacancyKpis {
  const abiertas = vacancies.filter(
    (v) => v.estado === "abierta" || v.estado === "pausada"
  ).length;
  const cubiertas = vacancies.filter((v) => v.estado === "cubierta").length;

  const cerradas = vacancies.filter(
    (v) => v.estado === "cubierta" && v.fechaCierre
  );
  const cierreDias = cerradas.map((v) =>
    daysBetween(v.fechaSolicitud, v.fechaCierre!)
  );
  const promedioCierreDias =
    cierreDias.length > 0
      ? Math.round(
          cierreDias.reduce((s, n) => s + n, 0) / cierreDias.length
        )
      : null;

  const cumple = vacancies.filter(vacancyMeetsSla).length;
  const cumplimientoSlaPct =
    vacancies.length > 0
      ? Math.round((cumple / vacancies.length) * 1000) / 10
      : 0;

  return {
    vacantesAbiertas: abiertas,
    vacantesCubiertas: cubiertas,
    promedioCierreDias,
    cumplimientoSlaPct,
  };
}

export type AreaCount = { area: string; count: number };

export function aggregateVacanciesByArea(vacancies: Vacancy[]): AreaCount[] {
  const map = new Map<string, number>();
  for (const v of vacancies) {
    map.set(v.area, (map.get(v.area) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);
}
