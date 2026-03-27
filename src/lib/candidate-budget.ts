import type { Vacancy } from "@/types/vacancy";

export type BudgetStatus = "excede" | "en_banda" | "sin_banda";

/**
 * Compara la expectativa con el tope de banda (bandaMax) de la vacante.
 * Si no hay banda máxima definida, no aplica el semáforo.
 */
export function getBudgetStatus(
  expectativa: number,
  vacancy: Vacancy | undefined
): BudgetStatus {
  const max = vacancy?.bandaMax;
  if (max == null || Number.isNaN(max)) return "sin_banda";
  if (expectativa > max) return "excede";
  return "en_banda";
}
