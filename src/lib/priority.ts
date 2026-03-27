import type { VacancyPriority } from "@/types/vacancy";

/** Alta: rojo, Media: amarillo, Baja: azul. */
export function priorityToBadgeVariant(
  p: VacancyPriority
): "danger" | "warning" | "info" {
  switch (p) {
    case "Alta":
      return "danger";
    case "Media":
      return "warning";
    default:
      return "info";
  }
}
