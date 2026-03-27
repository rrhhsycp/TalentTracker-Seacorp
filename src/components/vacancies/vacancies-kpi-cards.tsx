import {
  Briefcase,
  CalendarClock,
  Percent,
  UserCheck,
} from "lucide-react";

import type { VacancyKpis } from "@/lib/vacancy-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items: {
  label: string;
  icon: typeof Briefcase;
  format: (k: VacancyKpis) => string;
}[] = [
  {
    label: "Vacantes Abiertas",
    icon: Briefcase,
    format: (k) => String(k.vacantesAbiertas),
  },
  {
    label: "Vacantes Cubiertas",
    icon: UserCheck,
    format: (k) => String(k.vacantesCubiertas),
  },
  {
    label: "Promedio de Cierre",
    icon: CalendarClock,
    format: (k) =>
      k.promedioCierreDias === null ? "—" : `${k.promedioCierreDias} días`,
  },
  {
    label: "% Cumplimiento SLA",
    icon: Percent,
    format: (k) => `${k.cumplimientoSlaPct}%`,
  },
];

export function VacanciesKpiCards({ kpis }: { kpis: VacancyKpis }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, icon: Icon, format }) => (
        <Card key={label} className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-slate-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">
              {format(kpis)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
