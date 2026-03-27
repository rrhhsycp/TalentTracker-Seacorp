"use client";

import { useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import type {
  Vacancy,
  VacancyCurrency,
  VacancyEstado,
  VacancyPriority,
  VacancySede,
} from "@/types/vacancy";
import { VACANCY_SEDES } from "@/types/vacancy";
import type { VacancyCandidate } from "@/data/mock-vacancy-candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMoney(
  amount: number | undefined,
  currency: VacancyCurrency = "PEN"
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}

function labelEstado(estado: VacancyEstado): string {
  switch (estado) {
    case "abierta":
      return "Abierta";
    case "pausada":
      return "Pausada";
    case "cubierta":
      return "Cubierta";
    case "contratado":
      return "Contratado";
  }
}

export function VacancyDetailSheet({
  vacancy,
  candidates,
  open,
  onOpenChange,
  onUpdate,
}: {
  vacancy: Vacancy | null;
  candidates: VacancyCandidate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Vacancy>) => void;
}) {
  const v = vacancy;
  const moneda = v?.moneda ?? "PEN";
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<{
    cargo: string;
    area: string;
    sede: VacancySede;
    prioridad: VacancyPriority;
    sueldoObjetivo: string;
    moneda: VacancyCurrency;
    bandaMin: string;
    bandaMax: string;
    fechaSolicitud: string;
  } | null>(null);

  const currencies = useMemo(() => ["PEN", "USD"] as VacancyCurrency[], []);
  const canEdit = !!v && !(!v.cargo && !v.area);

  const startEdit = () => {
    if (!v) return;
    setDraft({
      cargo: v.cargo,
      area: v.area,
      sede: v.sede,
      prioridad: v.prioridad,
      sueldoObjetivo:
        v.sueldoObjetivo != null ? String(v.sueldoObjetivo) : "",
      moneda: v.moneda ?? "PEN",
      bandaMin: v.bandaMin != null ? String(v.bandaMin) : "",
      bandaMax: v.bandaMax != null ? String(v.bandaMax) : "",
      fechaSolicitud: v.fechaSolicitud,
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraft(null);
  };

  const handleSave = () => {
    if (!v || !draft) return;

    const parseNumber = (s: string): number | undefined => {
      const t = s.trim();
      if (!t) return undefined;
      const n = Number(t);
      if (Number.isNaN(n)) return undefined;
      return n;
    };

    onUpdate(v.id, {
      cargo: draft.cargo.trim() || v.cargo,
      area: draft.area.trim() || v.area,
      sede: draft.sede,
      prioridad: draft.prioridad,
      sueldoObjetivo: parseNumber(draft.sueldoObjetivo),
      moneda: draft.moneda,
      bandaMin: parseNumber(draft.bandaMin),
      bandaMax: parseNumber(draft.bandaMax),
      fechaSolicitud: draft.fechaSolicitud,
    });

    setEditMode(false);
    setDraft(null);
  };

  const handleCerrar = () => {
    if (!v) return;
    const hoy = new Date().toISOString().slice(0, 10);
    onUpdate(v.id, { estado: "cubierta", fechaCierre: hoy });
    onOpenChange(false);
  };

  const handlePausar = () => {
    if (!v) return;
    onUpdate(v.id, { estado: "pausada" });
    onOpenChange(false);
  };

  const handleReactivar = () => {
    if (!v) return;
    onUpdate(v.id, { estado: "abierta" });
    onOpenChange(false);
  };

  const handleEstado = (estado: VacancyEstado) => {
    if (!v) return;
    if (estado === "cubierta") {
      const hoy = new Date().toISOString().slice(0, 10);
      onUpdate(v.id, { estado: "cubierta", fechaCierre: hoy });
      return;
    }
    onUpdate(v.id, { estado, fechaCierre: undefined });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "flex w-full flex-col overflow-hidden border-slate-200 p-0 sm:max-w-lg"
        )}
        aria-describedby={undefined}
      >
        {v ? (
          <>
            <SheetTitle className="sr-only">
              Detalle de vacante: {v.cargo}
            </SheetTitle>
            <div className="flex shrink-0 items-start justify-between gap-3 bg-[#0f2744] px-5 py-4 text-white">
              <div className="min-w-0 flex-1 pr-2">
                <h2 className="text-lg font-semibold leading-tight">
                  {v.cargo}
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  Detalle de la vacante
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                    onClick={startEdit}
                    disabled={!canEdit}
                  >
                    Editar vacante
                  </Button>
                )}
                <SheetClose asChild>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Cerrar panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {!editMode ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailBlock label="Cargo" value={v.cargo} />
                  <DetailBlock label="Área" value={v.area} />
                  <DetailBlock label="Sede" value={v.sede} />
                  <DetailBlock label="Prioridad" value={v.prioridad} />
                  <DetailBlock
                    label="Fecha de solicitud"
                    value={formatDate(v.fechaSolicitud)}
                  />
                  <DetailBlock
                    label="Sueldo objetivo"
                    value={formatMoney(v.sueldoObjetivo, moneda)}
                  />
                  <DetailBlock
                    label="Banda salarial"
                    value={
                      v.bandaMin != null || v.bandaMax != null ? (
                        <>
                          {formatMoney(v.bandaMin, moneda)} —{" "}
                          {formatMoney(v.bandaMax, moneda)}
                        </>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-cargo">Cargo</Label>
                      <Input
                        id="edit-cargo"
                        value={draft?.cargo ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d
                              ? { ...d, cargo: e.target.value }
                              : d
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-area">Área</Label>
                      <Input
                        id="edit-area"
                        value={draft?.area ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d
                              ? { ...d, area: e.target.value }
                              : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-sede">Sede</Label>
                      <Select
                        value={draft?.sede ?? v.sede}
                        onValueChange={(val) =>
                          setDraft((d) =>
                            d ? { ...d, sede: val as VacancySede } : d
                          )
                        }
                      >
                        <SelectTrigger id="edit-sede">
                          <SelectValue placeholder="Seleccionar sede" />
                        </SelectTrigger>
                        <SelectContent>
                          {VACANCY_SEDES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-prioridad">Prioridad</Label>
                      <Select
                        value={draft?.prioridad ?? v.prioridad}
                        onValueChange={(val) =>
                          setDraft((d) =>
                            d
                              ? {
                                  ...d,
                                  prioridad: val as VacancyPriority,
                                }
                              : d
                          )
                        }
                      >
                        <SelectTrigger id="edit-prioridad">
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-fecha">Fecha de solicitud</Label>
                      <Input
                        id="edit-fecha"
                        type="date"
                        value={draft?.fechaSolicitud ?? v.fechaSolicitud}
                        onChange={(e) =>
                          setDraft((d) =>
                            d
                              ? { ...d, fechaSolicitud: e.target.value }
                              : d
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-moneda">Moneda</Label>
                      <Select
                        value={draft?.moneda ?? (v.moneda ?? "PEN")}
                        onValueChange={(val) =>
                          setDraft((d) =>
                            d
                              ? { ...d, moneda: val as VacancyCurrency }
                              : d
                          )
                        }
                      >
                        <SelectTrigger id="edit-moneda">
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((cur) => (
                            <SelectItem key={cur} value={cur}>
                              {cur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-sueldo">Sueldo objetivo</Label>
                      <Input
                        id="edit-sueldo"
                        type="number"
                        step="0.01"
                        min={0}
                        value={draft?.sueldoObjetivo ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d
                              ? { ...d, sueldoObjetivo: e.target.value }
                              : d
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-banda-min">Banda mínima</Label>
                      <Input
                        id="edit-banda-min"
                        type="number"
                        step="0.01"
                        min={0}
                        value={draft?.bandaMin ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, bandaMin: e.target.value } : d
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="edit-banda-max">Banda máxima</Label>
                      <Input
                        id="edit-banda-max"
                        type="number"
                        step="0.01"
                        min={0}
                        value={draft?.bandaMax ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, bandaMax: e.target.value } : d
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="rounded-lg"
                      onClick={handleSave}
                    >
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-semibold text-slate-900">
                  Candidatos Postulados
                </h3>
                {candidates.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No hay candidatos en esta vacante.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50">
                    {candidates.map((c, i) => (
                      <li
                        key={`${c.nombre}-${i}`}
                        className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {c.nombre}
                        </span>
                        <span className="text-sm text-slate-600">{c.etapa}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estado de la vacante
                </p>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estado-vacante">Estado</Label>
                      <Select
                        value={v.estado}
                        onValueChange={(val) => handleEstado(val as VacancyEstado)}
                      >
                        <SelectTrigger id="estado-vacante">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abierta">Abierta</SelectItem>
                          <SelectItem value="pausada">Pausada</SelectItem>
                          <SelectItem value="contratado">Contratado</SelectItem>
                          <SelectItem value="cubierta">Cubierta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DetailBlock
                      label="Estado actual"
                      value={
                        v.estado === "cubierta" && v.fechaCierre
                          ? `${labelEstado(v.estado)} (${formatDate(v.fechaCierre)})`
                          : labelEstado(v.estado)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {v.estado === "abierta" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        onClick={handlePausar}
                      >
                        Poner en pausa
                      </Button>
                    )}
                    {v.estado === "pausada" && (
                      <Button
                        type="button"
                        className="rounded-lg"
                        onClick={handleReactivar}
                      >
                        Reactivar vacante
                      </Button>
                    )}
                    {v.estado !== "cubierta" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg border-slate-300"
                        onClick={handleCerrar}
                      >
                        Cerrar vacante
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
