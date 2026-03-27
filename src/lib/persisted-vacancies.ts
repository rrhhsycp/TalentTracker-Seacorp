import type { Vacancy } from "@/types/vacancy";

const LS_KEY = "talenttrack:vacancies:v1";

export function loadPersistedVacancies(): Vacancy[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Vacancy[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistVacancies(vacancies: Vacancy[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(vacancies));
  } catch {
    // Ignore: storage may be full or disabled.
  }
}

