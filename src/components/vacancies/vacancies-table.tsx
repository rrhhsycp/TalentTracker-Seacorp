"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { Vacancy } from "@/types/vacancy";
import type { VacancyCandidate } from "@/data/mock-vacancy-candidates";
import { priorityToBadgeVariant } from "@/lib/priority";
import { getDaysSinceRequest, getSlaStatus, type SlaStatus } from "@/lib/sla";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VacancyDetailSheet } from "@/components/vacancies/vacancy-detail-sheet";
import { cn } from "@/lib/utils";

function slaDotClass(status: SlaStatus): string {
  switch (status) {
    case "green":
      return "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]";
    case "yellow":
      return "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.3)]";
    case "red":
      return "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]";
  }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function VacanciesTable({
  vacancies,
  candidatesByVacancyId,
  onVacancyUpdate,
  onVacancyDelete,
}: {
  vacancies: Vacancy[];
  candidatesByVacancyId: Record<string, VacancyCandidate[]>;
  onVacancyUpdate: (id: string, patch: Partial<Vacancy>) => void;
  onVacancyDelete: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Vacancy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleVacancyUpdate = (id: string, patch: Partial<Vacancy>) => {
    onVacancyUpdate(id, patch);
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const openDetail = selected !== null;
  const candidates = selected
    ? (candidatesByVacancyId[selected.id] ?? [])
    : [];

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cargo</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha solicitud</TableHead>
              <TableHead className="w-[140px]">SLA</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vacancies.map((row) => {
              const days = getDaysSinceRequest(
                new Date(row.fechaSolicitud + "T12:00:00")
              );
              const status = getSlaStatus(days);
              const slaActivo =
                row.estado === "abierta" || row.estado === "pausada";
              const candidateCount = (candidatesByVacancyId[row.id] ?? []).length;
              const canDelete = candidateCount === 0;

              return (
                <TableRow
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  onClick={() => setSelected(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(row);
                    }
                  }}
                >
                  <TableCell className="font-medium">{row.cargo}</TableCell>
                  <TableCell className="text-slate-600">{row.area}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.estado === "pausada" ? (
                        <Badge variant="secondary">Pausa</Badge>
                      ) : row.estado === "contratado" ? (
                        <Badge variant="success">Contratado</Badge>
                      ) : (
                        <Badge variant={priorityToBadgeVariant(row.prioridad)}>
                          {row.prioridad}
                        </Badge>
                      )}
                      {row.estado === "pausada" && (
                        <span className="text-xs text-slate-500">
                          ({row.prioridad})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(row.fechaSolicitud)}
                  </TableCell>
                  <TableCell>
                    {slaActivo ? (
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-block h-3 w-3 shrink-0 rounded-full",
                            slaDotClass(status)
                          )}
                          title={
                            status === "green"
                              ? "Dentro de SLA (< 7 días)"
                              : status === "yellow"
                                ? "Atención (7–15 días)"
                                : "Fuera de umbral (> 15 días)"
                          }
                          aria-label={`Estado SLA ${status}`}
                        />
                        <span className="text-sm text-slate-600">
                          {days} {days === 1 ? "día" : "días"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canDelete) setDeleteId(row.id);
                              }}
                              disabled={!canDelete}
                              aria-label="Eliminar vacante"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!canDelete && (
                          <TooltipContent>
                            Tiene procesos activos y no se puede eliminar.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <VacancyDetailSheet
        vacancy={selected}
        candidates={candidates}
        open={openDetail}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
        onUpdate={handleVacancyUpdate}
      />
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vacante</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la vacante de forma permanente del estado local.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteId) return;
                onVacancyDelete(deleteId);
                if (selected?.id === deleteId) setSelected(null);
                setDeleteId(null);
              }}
            >
              Confirmar eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
