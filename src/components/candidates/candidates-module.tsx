"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, FileText, Shuffle } from "lucide-react";

import type { Candidate, CandidateSede, CandidateStage } from "@/types/candidate";
import { CANDIDATE_SEDES, CANDIDATE_STAGES } from "@/types/candidate";
import type { Vacancy } from "@/types/vacancy";
import { mockCandidateCvProfiles } from "@/data/mock-candidate-profiles";
import { getBudgetStatus } from "@/lib/candidate-budget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
);

const textareaClassName = cn(
  "min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
  "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
);

function formatExpectativa(amount: number, moneda: string): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function vacancyById(
  vacancies: Vacancy[],
  id: string
): Vacancy | undefined {
  return vacancies.find((v) => v.id === id);
}

export function CandidatesModule({
  initialCandidates,
  vacancies,
}: {
  initialCandidates: Candidate[];
  vacancies: Vacancy[];
}) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [sedeFilter, setSedeFilter] = useState<CandidateSede | "todas">(
    "todas"
  );
  const [etapaFilter, setEtapaFilter] = useState<CandidateStage | "todas">(
    "todas"
  );

  const [stageDialogId, setStageDialogId] = useState<string | null>(null);
  const [draftEtapa, setDraftEtapa] = useState<CandidateStage>(
    CANDIDATE_STAGES[0]
  );

  const [cvDialogId, setCvDialogId] = useState<string | null>(null);
  const [interviewDialogId, setInterviewDialogId] = useState<string | null>(
    null
  );
  const [interviewFecha, setInterviewFecha] = useState("");
  const [interviewHora, setInterviewHora] = useState("");
  const [interviewNotas, setInterviewNotas] = useState("");
  const [interviewSuccess, setInterviewSuccess] = useState(false);

  useEffect(() => {
    if (interviewDialogId) {
      setInterviewFecha("");
      setInterviewHora("");
      setInterviewNotas("");
      setInterviewSuccess(false);
    }
  }, [interviewDialogId]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (sedeFilter !== "todas" && c.sede !== sedeFilter) return false;
      if (etapaFilter !== "todas" && c.etapa !== etapaFilter) return false;
      return true;
    });
  }, [candidates, sedeFilter, etapaFilter]);

  const editingCandidate =
    stageDialogId == null
      ? null
      : candidates.find((c) => c.id === stageDialogId) ?? null;

  const cvCandidate =
    cvDialogId == null ? null : candidates.find((c) => c.id === cvDialogId) ?? null;
  const cvProfile = cvCandidate
    ? mockCandidateCvProfiles[cvCandidate.id]
    : undefined;

  const interviewCandidate =
    interviewDialogId == null
      ? null
      : candidates.find((c) => c.id === interviewDialogId) ?? null;

  const openStageDialog = (c: Candidate) => {
    setDraftEtapa(c.etapa);
    setStageDialogId(c.id);
  };

  const confirmStageMove = () => {
    if (!stageDialogId) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === stageDialogId ? { ...c, etapa: draftEtapa } : c
      )
    );
    setStageDialogId(null);
  };

  const confirmInterview = () => {
    if (!interviewFecha.trim() || !interviewHora.trim()) return;
    setInterviewSuccess(true);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Candidatos</h1>
        <p className="text-sm text-slate-600">
          Pipeline de postulantes: sede, vacante, etapa y control de expectativa
          frente a la banda salarial de la vacante.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="filter-sede" className="text-slate-700">
            Sede
          </Label>
          <Select
            value={sedeFilter}
            onValueChange={(v) => setSedeFilter(v as CandidateSede | "todas")}
          >
            <SelectTrigger
              id="filter-sede"
              className={selectClassName}
              aria-label="Filtrar por sede"
            >
              <SelectValue placeholder="Todas las sedes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las sedes</SelectItem>
              {CANDIDATE_SEDES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-etapa" className="text-slate-700">
            Etapa
          </Label>
          <Select
            value={etapaFilter}
            onValueChange={(v) => setEtapaFilter(v as CandidateStage | "todas")}
          >
            <SelectTrigger
              id="filter-etapa"
              className={selectClassName}
              aria-label="Filtrar por etapa"
            >
              <SelectValue placeholder="Todas las etapas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las etapas</SelectItem>
              {CANDIDATE_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-slate-500 sm:ml-auto">
          Mostrando{" "}
          <span className="font-medium text-slate-700">{filtered.length}</span>{" "}
          de {candidates.length}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nombre</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead className="min-w-[160px]">
                Vacante a la que postula
              </TableHead>
              <TableHead className="min-w-[150px]">Etapa actual</TableHead>
              <TableHead>Expectativa salarial</TableHead>
              <TableHead className="min-w-[170px]">Presupuesto</TableHead>
              <TableHead className="min-w-[280px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const vac = vacancyById(vacancies, c.vacancyId);
              const budget = getBudgetStatus(c.expectativaSalarial, vac);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="text-slate-600">{c.sede}</TableCell>
                  <TableCell className="text-slate-700">
                    {vac?.cargo ?? "—"}
                  </TableCell>
                  <TableCell className="text-slate-700">{c.etapa}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums text-slate-700">
                    {formatExpectativa(c.expectativaSalarial, c.moneda)}
                  </TableCell>
                  <TableCell>
                    {budget === "excede" && (
                      <Badge variant="danger" className="font-normal">
                        ⚠️ Excede Presupuesto
                      </Badge>
                    )}
                    {budget === "en_banda" && (
                      <Badge variant="success" className="font-normal">
                        ✅ En Banda
                      </Badge>
                    )}
                    {budget === "sin_banda" && (
                      <Badge variant="secondary" className="font-normal">
                        Sin banda en vacante
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setCvDialogId(c.id)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Ver CV
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setInterviewDialogId(c.id)}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Programar Entrevista
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => openStageDialog(c)}
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        Mover de Etapa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          No hay candidatos con los filtros seleccionados.
        </p>
      )}

      <Dialog
        open={stageDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setStageDialogId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mover de Etapa</DialogTitle>
          </DialogHeader>
          {editingCandidate && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600">
                Candidato:{" "}
                <span className="font-medium text-slate-900">
                  {editingCandidate.nombre}
                </span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="nueva-etapa">Nueva etapa</Label>
                <Select
                  value={draftEtapa}
                  onValueChange={(v) => setDraftEtapa(v as CandidateStage)}
                >
                  <SelectTrigger
                    id="nueva-etapa"
                    className={selectClassName}
                    aria-label="Seleccionar nueva etapa"
                  >
                    <SelectValue placeholder="Selecciona una etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setStageDialogId(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={confirmStageMove}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cvDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setCvDialogId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left">
            <DialogTitle>Curriculum vitae</DialogTitle>
            {cvCandidate && (
              <DialogDescription>
                Vista previa del perfil de {cvCandidate.nombre}.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-5">
            {cvCandidate && cvProfile ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {cvCandidate.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Sede {cvCandidate.sede} ·{" "}
                    {vacancyById(vacancies, cvCandidate.vacancyId)?.cargo ??
                      "Vacante"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>{cvProfile.email}</span>
                    <span>{cvProfile.telefono}</span>
                  </div>
                </div>
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resumen
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {cvProfile.resumen}
                  </p>
                </section>
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Experiencia
                  </h4>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-700">
                    {cvProfile.experiencia.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Educación
                  </h4>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-700">
                    {cvProfile.educacion.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
                <p className="text-xs text-slate-400">
                  La descarga en PDF se conectará cuando el almacenamiento de
                  documentos esté integrado.
                </p>
              </div>
            ) : cvCandidate ? (
              <p className="text-sm text-slate-600">
                Aún no hay información de CV cargada para este candidato.
              </p>
            ) : null}
          </div>
          <DialogFooter className="border-t border-slate-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setCvDialogId(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={interviewDialogId !== null}
        onOpenChange={(o) => {
          if (!o) setInterviewDialogId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Programar Entrevista</DialogTitle>
            {interviewCandidate && (
              <DialogDescription>
                Define fecha y hora para {interviewCandidate.nombre}.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[calc(90vh-12rem)] overflow-y-auto">
            {interviewSuccess && interviewCandidate ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <p className="text-base font-medium text-slate-900">
                  Entrevista registrada
                </p>
                <p className="text-sm text-slate-600">
                  {interviewCandidate.nombre}
                  <br />
                  <span className="text-slate-600">
                    {new Intl.DateTimeFormat("es-PE", {
                      dateStyle: "long",
                    }).format(new Date(interviewFecha + "T12:00:00"))}{" "}
                    a las {interviewHora}
                  </span>
                </p>
                {interviewNotas.trim() ? (
                  <p className="text-left text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Notas:</span>{" "}
                    {interviewNotas}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  La sincronización con calendario externo se añadirá en una
                  siguiente iteración.
                </p>
              </div>
            ) : (
              interviewCandidate && (
                <div className="space-y-4 py-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="entrevista-fecha">Fecha</Label>
                      <Input
                        id="entrevista-fecha"
                        type="date"
                        value={interviewFecha}
                        onChange={(e) => setInterviewFecha(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entrevista-hora">Hora</Label>
                      <Input
                        id="entrevista-hora"
                        type="time"
                        value={interviewHora}
                        onChange={(e) => setInterviewHora(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrevista-notas">Notas (opcional)</Label>
                    <textarea
                      id="entrevista-notas"
                      className={textareaClassName}
                      placeholder="Ej. Entrevista con jefe directo, sala 2…"
                      value={interviewNotas}
                      onChange={(e) => setInterviewNotas(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )
            )}
          </div>
          <DialogFooter>
            {interviewSuccess ? (
              <Button
                type="button"
                className="rounded-lg"
                onClick={() => setInterviewDialogId(null)}
              >
                Listo
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setInterviewDialogId(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="rounded-lg"
                  onClick={confirmInterview}
                  disabled={!interviewFecha.trim() || !interviewHora.trim()}
                >
                  Confirmar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
