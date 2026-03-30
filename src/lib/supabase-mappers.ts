import type {
  Candidate,
  CandidateGradoAcademico,
  CandidateSede,
  CandidateStage,
} from "@/types/candidate";
import type { Vacancy, VacancyCurrency, VacancyEstado, VacancyPriority, VacancySede } from "@/types/vacancy";

/** Fila devuelta por Supabase (snake_case). */
export function mapVacancyRow(row: Record<string, unknown>): Vacancy {
  // Algunas bases usan `status` o `estado_vacante` en vez de `estado`.
  const estadoRaw =
    (row.estado as VacancyEstado | undefined) ??
    (row.status as VacancyEstado | undefined) ??
    (row.estado_vacante as VacancyEstado | undefined);

  return {
    id: String(row.id ?? ""),
    cargo: String(row.cargo ?? ""),
    area: String(row.area ?? ""),
    sede: row.sede as VacancySede,
    prioridad: row.prioridad as VacancyPriority,
    fechaSolicitud:
      typeof row.fecha_solicitud === "string"
        ? row.fecha_solicitud.slice(0, 10)
        : String(row.fecha_solicitud ?? "").slice(0, 10),
    estado: estadoRaw ?? "abierta",
    fechaCierre:
      row.fecha_cierre != null && row.fecha_cierre !== ""
        ? String(row.fecha_cierre).slice(0, 10)
        : undefined,
    jefeSolicitante: row.jefe_solicitante != null ? String(row.jefe_solicitante) : undefined,
    moneda: row.moneda as VacancyCurrency | undefined,
    sueldoObjetivo:
      row.sueldo_objetivo != null && row.sueldo_objetivo !== ""
        ? Number(row.sueldo_objetivo)
        : undefined,
    bandaMin:
      row.banda_minima != null && row.banda_minima !== ""
        ? Number(row.banda_minima)
        : undefined,
    bandaMax:
      row.banda_maxima != null && row.banda_maxima !== ""
        ? Number(row.banda_maxima)
        : undefined,
    fechaObjetivoCierre:
      row.fecha_objetivo_cierre != null && row.fecha_objetivo_cierre !== ""
        ? String(row.fecha_objetivo_cierre).slice(0, 10)
        : undefined,
    createdAt: row.created_at != null ? String(row.created_at) : undefined,
    updatedAt: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

/** Convierte un parcial de `Vacancy` a columnas de Supabase (snake_case). */
export function vacancyPatchToDbRow(patch: Partial<Vacancy>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.cargo !== undefined) row.cargo = patch.cargo;
  if (patch.area !== undefined) row.area = patch.area;
  if (patch.sede !== undefined) row.sede = patch.sede;
  if (patch.prioridad !== undefined) row.prioridad = patch.prioridad;
  if (patch.fechaSolicitud !== undefined) row.fecha_solicitud = patch.fechaSolicitud;
  if ("fechaCierre" in patch) row.fecha_cierre = patch.fechaCierre ?? null;
  if ("jefeSolicitante" in patch) row.jefe_solicitante = patch.jefeSolicitante ?? null;
  if (patch.moneda !== undefined) row.moneda = patch.moneda;
  if ("sueldoObjetivo" in patch) row.sueldo_objetivo = patch.sueldoObjetivo ?? null;
  if ("bandaMin" in patch) row.banda_minima = patch.bandaMin ?? null;
  if ("bandaMax" in patch) row.banda_maxima = patch.bandaMax ?? null;
  if ("fechaObjetivoCierre" in patch) {
    row.fecha_objetivo_cierre = patch.fechaObjetivoCierre ?? null;
  }
  return row;
}

export function mapCandidateRow(row: Record<string, unknown>): Candidate {
  return {
    id: String(row.id ?? ""),
    nombre: String(row.nombre_completo ?? ""),
    dni: String(row.dni ?? ""),
    celular: String(row.celular ?? ""),
    correo: String(row.correo ?? ""),
    sede: row.sede as CandidateSede,
    vacancyId: String(row.vacante_id ?? ""),
    etapa: row.etapa as CandidateStage,
    expectativaSalarial: Number(row.expectativa_salarial ?? 0),
    moneda: row.moneda as VacancyCurrency,
    gradoAcademico: row.grado_academico as CandidateGradoAcademico,
    estadoEstudios: row.estado_estudios as Candidate["estadoEstudios"],
    carreraEspecialidad: String(row.carrera ?? ""),
    aniosExperiencia: Number(row.anios_experiencia ?? 0),
    ultimoCargo: String(row.ultimo_cargo ?? ""),
    observaciones: String(row.observaciones ?? ""),
    createdAt: row.created_at != null ? String(row.created_at) : undefined,
    updatedAt: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}
