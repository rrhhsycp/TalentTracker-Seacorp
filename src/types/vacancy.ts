export type VacancyPriority = "Alta" | "Media" | "Baja";

export type VacancyEstado = "abierta" | "pausada" | "cubierta" | "contratado";

export type VacancyCurrency = "PEN" | "USD";

/** Ubicación física de la posición (distinto del área organizacional). */
export type VacancySede = "Sechura" | "Paita" | "Lima" | "Campamento";

export const VACANCY_SEDES: VacancySede[] = [
  "Sechura",
  "Paita",
  "Lima",
  "Campamento",
];

export type Vacancy = {
  id: string;
  cargo: string;
  area: string;
  sede: VacancySede;
  prioridad: VacancyPriority;
  fechaSolicitud: string;
  estado: VacancyEstado;
  fechaCierre?: string;
  jefeSolicitante?: string;
  moneda?: VacancyCurrency;
  sueldoObjetivo?: number;
  bandaMin?: number;
  bandaMax?: number;
  fechaObjetivoCierre?: string;
  createdAt?: string;
  updatedAt?: string;
};
