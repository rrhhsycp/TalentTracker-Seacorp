import type { VacancyCurrency } from "@/types/vacancy";

export type CandidateSede = "Sechura" | "Paita" | "Lima" | "Campamento";

export const CANDIDATE_SEDES: CandidateSede[] = [
  "Sechura",
  "Paita",
  "Lima",
  "Campamento",
];

export type CandidateGradoAcademico =
  | "Técnico"
  | "Egresado"
  | "Bachiller"
  | "Licenciado"
  | "Maestría"
  | "Doctorado"
  | "otro";

export const CANDIDATE_GRADOS_ACADEMICOS: CandidateGradoAcademico[] = [
  "Técnico",
  "Egresado",
  "Bachiller",
  "Licenciado",
  "Maestría",
  "Doctorado",
  "otro",
];

export type CandidateEstadoEstudios = "Concluidos" | "En proceso";
export const CANDIDATE_ESTADOS_ESTUDIOS: CandidateEstadoEstudios[] = ["Concluidos", "En proceso"];

export const CANDIDATE_STAGES = [
  "Filtro Inicial",
  "Entrevista RRHH",
  "Evaluación Técnica",
  "Examen Médico",
  "Oferta",
  "Contratado",
  "Rechazado",
] as const;

export type CandidateStage = (typeof CANDIDATE_STAGES)[number];

export type Candidate = {
  id: string;
  nombre: string;
  dni: string;
  celular: string;
  correo: string;
  residencia: string;
  sede: CandidateSede;
  vacancyId: string;
  etapa: CandidateStage;
  /** Expectativa en la misma moneda que la vacante asociada */
  expectativaSalarial: number;
  moneda: VacancyCurrency;

  gradoAcademico: CandidateGradoAcademico;
  estadoEstudios: CandidateEstadoEstudios;
  carreraEspecialidad: string;
  aniosExperiencia: number;
  ultimoCargo: string;
  observaciones: string;
  createdAt?: string;
  updatedAt?: string;
};
