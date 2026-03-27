export type VacancyCandidate = {
  nombre: string;
  etapa: string;
};

/** Candidatos de ejemplo por id de vacante (mock). */
export const mockCandidatesByVacancy: Record<string, VacancyCandidate[]> = {
  "1": [
    { nombre: "Carlos Mendoza", etapa: "Entrevista técnica" },
    { nombre: "Ana Torres", etapa: "Screening" },
    { nombre: "Luis Prado", etapa: "Oferta" },
  ],
  "2": [
    { nombre: "María Flores", etapa: "Entrevista HR" },
    { nombre: "Jorge Castillo", etapa: "Evaluación" },
  ],
  "3": [{ nombre: "Patricia Ruiz", etapa: "Contratado" }],
  "4": [
    { nombre: "Diego Salas", etapa: "Entrevista gerencial" },
    { nombre: "Elena Vásquez", etapa: "Screening" },
    { nombre: "Roberto Núñez", etapa: "Referencias" },
  ],
  "5": [],
  "6": [{ nombre: "Sandra Ortiz", etapa: "Contratado" }],
  "7": [
    { nombre: "Miguel Ángel León", etapa: "Prueba práctica" },
    { nombre: "Fiorella Ríos", etapa: "Entrevista técnica" },
  ],
};
