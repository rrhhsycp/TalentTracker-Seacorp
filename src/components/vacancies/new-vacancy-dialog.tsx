"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import {
  VACANCY_SEDES,
  type Vacancy,
  type VacancyCurrency,
  type VacancyPriority,
  type VacancySede,
} from "@/types/vacancy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 px-6 py-5 last:border-b-0">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 sm:col-span-1", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

const emptyForm = {
  cargo: "",
  area: "",
  sede: "Lima" as VacancySede,
  jefeSolicitante: "",
  prioridad: "Media" as VacancyPriority,
  moneda: "PEN" as VacancyCurrency,
  sueldoObjetivo: "",
  bandaMin: "",
  bandaMax: "",
  fechaSolicitud: new Date().toISOString().slice(0, 10),
  fechaObjetivoCierre: "",
};

export function NewVacancyDialog({
  onCreated,
}: {
  onCreated: (v: Vacancy) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    if (!open) setForm({ ...emptyForm, fechaSolicitud: new Date().toISOString().slice(0, 10) });
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const sueldo = form.sueldoObjetivo ? Number(form.sueldoObjetivo) : undefined;
    const min = form.bandaMin ? Number(form.bandaMin) : undefined;
    const max = form.bandaMax ? Number(form.bandaMax) : undefined;

    const v: Vacancy = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `vac-${Date.now()}`,
      cargo: form.cargo.trim() || "Sin cargo",
      area: form.area.trim() || "General",
      sede: form.sede,
      prioridad: form.prioridad,
      fechaSolicitud: form.fechaSolicitud,
      estado: "abierta",
      jefeSolicitante: form.jefeSolicitante.trim() || undefined,
      moneda: form.moneda,
      sueldoObjetivo: sueldo,
      bandaMin: min,
      bandaMax: max,
      fechaObjetivoCierre: form.fechaObjetivoCierre || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    onCreated(v);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="shrink-0 rounded-lg">
          <Plus className="h-4 w-4" />
          Nueva vacante
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle>Nueva vacante</DialogTitle>
          <DialogDescription>
            Completa los datos generales, económicos y fechas de la posición.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-5rem)] overflow-y-auto"
        >
          <Section title="General">
            <Field id="cargo" label="Cargo">
              <Input
                id="cargo"
                required
                value={form.cargo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cargo: e.target.value }))
                }
                placeholder="Ej. Analista de datos"
              />
            </Field>
            <Field id="area" label="Área">
              <Input
                id="area"
                required
                value={form.area}
                onChange={(e) =>
                  setForm((f) => ({ ...f, area: e.target.value }))
                }
                placeholder="Ej. Planta, Administrativo"
              />
            </Field>
            <Field id="sede" label="Sede">
              <select
                id="sede"
                className={selectClassName}
                value={form.sede}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sede: e.target.value as VacancySede,
                  }))
                }
              >
                {VACANCY_SEDES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="jefe-solicitante" label="Jefe solicitante">
              <Input
                id="jefe-solicitante"
                value={form.jefeSolicitante}
                onChange={(e) =>
                  setForm((f) => ({ ...f, jefeSolicitante: e.target.value }))
                }
                placeholder="Nombre del solicitante"
              />
            </Field>
            <Field id="prioridad" label="Prioridad">
              <select
                id="prioridad"
                className={selectClassName}
                value={form.prioridad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    prioridad: e.target.value as VacancyPriority,
                  }))
                }
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </Field>
          </Section>

          <Section title="Económica">
            <Field id="moneda" label="Moneda">
              <select
                id="moneda"
                className={selectClassName}
                value={form.moneda}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    moneda: e.target.value as VacancyCurrency,
                  }))
                }
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <Field id="sueldo-objetivo" label="Sueldo objetivo">
              <Input
                id="sueldo-objetivo"
                type="number"
                min={0}
                step="0.01"
                value={form.sueldoObjetivo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sueldoObjetivo: e.target.value }))
                }
                placeholder="0"
              />
            </Field>
            <Field id="banda-min" label="Banda mínima">
              <Input
                id="banda-min"
                type="number"
                min={0}
                step="0.01"
                value={form.bandaMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bandaMin: e.target.value }))
                }
                placeholder="0"
              />
            </Field>
            <Field id="banda-max" label="Banda máxima">
              <Input
                id="banda-max"
                type="number"
                min={0}
                step="0.01"
                value={form.bandaMax}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bandaMax: e.target.value }))
                }
                placeholder="0"
              />
            </Field>
          </Section>

          <Section title="Fechas">
            <Field id="fecha-solicitud" label="Fecha de solicitud">
              <Input
                id="fecha-solicitud"
                type="date"
                required
                value={form.fechaSolicitud}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaSolicitud: e.target.value }))
                }
              />
            </Field>
            <Field id="fecha-objetivo-cierre" label="Fecha objetivo de cierre">
              <Input
                id="fecha-objetivo-cierre"
                type="date"
                value={form.fechaObjetivoCierre}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fechaObjetivoCierre: e.target.value,
                  }))
                }
              />
            </Field>
          </Section>

          <DialogFooter className="sticky bottom-0 mt-0 rounded-b-xl border-t border-slate-100 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-lg">
              Guardar vacante
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
