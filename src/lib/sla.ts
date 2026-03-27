export type SlaStatus = "green" | "yellow" | "red";

/**
 * Días desde la fecha de solicitud hasta hoy (medianoche local).
 * Semáforo: menor a 7 verde; 7 a 15 amarillo (incluye el aislamiento del día 15 respecto a rojo estricto >15); mayor a 15 rojo.
 */
export function getDaysSinceRequest(requestDate: Date, now: Date = new Date()): number {
  const start = truncateToLocalDay(requestDate);
  const end = truncateToLocalDay(now);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function truncateToLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getSlaStatus(daysElapsed: number): SlaStatus {
  if (daysElapsed < 7) return "green";
  if (daysElapsed <= 15) return "yellow";
  return "red";
}
