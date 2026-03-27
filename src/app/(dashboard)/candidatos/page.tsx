"use client";

import { CandidatesScreen } from "@/components/candidates/candidates-screen";
import { mockCandidates } from "@/data/mock-candidates";
import { mockVacancies } from "@/data/mock-vacancies";

export default function CandidatosPage() {
  return (
    <CandidatesScreen
      initialCandidates={mockCandidates}
      vacancies={mockVacancies}
    />
  );
}

/*
import React, { useState } from 'react'
import { Plus, Search, User, GraduationCap, Briefcase, DollarSign, FileText, Edit } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Datos Maestros
const SEDES = ["Sechura", "Paita", "Lima", "Campamento"]
const GRADOS = ["Egresado", "Bachiller", "Licenciado", "Maestría", "Doctorado"]
const ESTADOS_ESTUDIO = ["Concluidos", "En proceso"]

export default function CandidatosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidato, setSelectedCandidato] = useState<any>(null)
  
  // Data de ejemplo (Simulando lo que vendría de tu gestión en Seacorp/SYCP)
  const [candidatos, setCandidatos] = useState([
    { 
      id: 1, nombre: "Rosa María Huamán", dni: "45678912", sede: "Lima", vacante: "Supervisor de Línea", 
      etapa: "Evaluación Técnica", expectativa: 10200, grado: "Maestría", estadoEstudio: "Concluidos",
      carrera: "Ingeniería Industrial", exp: 8, ultimoCargo: "Jefe de Turno", presupuesto: "Excede",
      observaciones: "Candidata con alta disponibilidad para viajar."
    },
    { 
      id: 2, nombre: "Jorge Luis Chiroque", dni: "78945612", sede: "Sechura", vacante: "Coordinador de Logística", 
      etapa: "Entrevista RRHH", expectativa: 6800, grado: "Bachiller", estadoEstudio: "Concluidos",
      carrera: "Administración", exp: 4, ultimoCargo: "Asistente Logístico", presupuesto: "En Banda",
      observaciones: "Conoce muy bien la zona de Sechura."
    },
  ])

  // Filtro por Vacante (Punto 5)
  const filteredCandidatos = candidatos.filter(c => 
    c.vacante.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Candidatos</h1>
          <p className="text-muted-foreground">Control de perfiles, grados académicos y bandas salariales.</p>
        </div>
        
        {/* BOTÓN NUEVO CANDIDATO (Punto 1 y 2) * /}
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
              <Plus className="h-4 w-4" /> Nuevo Candidato
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Ficha de Registro de Candidato</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Datos Base * /}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900 border-b pb-1 flex items-center gap-2"><User className="h-4 w-4"/> Datos Base</h3>
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input placeholder="Nombres y Apellidos" />
                </div>
                <div className="space-y-2">
                  <Label>DNI</Label>
                  <Input placeholder="8 dígitos" maxLength={8} />
                </div>
                <div className="space-y-2">
                  <Label>Sede</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccione Sede" /></SelectTrigger>
                    <SelectContent>
                      {SEDES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vacante a la que postula</Label>
                  <Input placeholder="Nombre del puesto" />
                </div>
              </div>

              {/* Perfil Académico y Profesional * /}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900 border-b pb-1 flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Perfil Académico</h3>
                <div className="space-y-2">
                  <Label>Grado Académico</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Grado" /></SelectTrigger>
                    <SelectContent>
                      {GRADOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado de Estudios</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS_ESTUDIO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Carrera / Especialidad</Label>
                  <Input placeholder="Ej. Ingeniería" />
                </div>
                <h3 className="font-semibold text-blue-900 border-b pb-1 pt-2 flex items-center gap-2"><Briefcase className="h-4 w-4"/> Perfil Profesional</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Años Exp.</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Último Cargo</Label>
                    <Input placeholder="Cargo" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-4 pt-2">
                <h3 className="font-semibold text-blue-900 border-b pb-1 flex items-center gap-2"><DollarSign className="h-4 w-4"/> Compensación y Otros</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expectativa Salarial (S/.)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Observaciones Relevantes</Label>
                    <Textarea placeholder="Detalles adicionales..." />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-900 w-full md:w-auto">Guardar Candidato</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* BUSCADOR POR VACANTE (Punto 5) * /}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar candidatos por vacante (ej: Supervisor, Logística)..." 
          className="border-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Vacante</TableHead>
                <TableHead>Grado Académico</TableHead> {/* Punto 3 * /}
                <TableHead>Años Exp.</TableHead> {/* Punto 3 * /}
                <TableHead>Presupuesto</TableHead> {/* Punto 4 * /}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidatos.map((c) => (
                <TableRow 
                  key={c.id} 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedCandidato(c)}
                >
                  <TableCell className="font-medium text-blue-900">{c.nombre}</TableCell>
                  <TableCell>{c.sede}</TableCell>
                  <TableCell>{c.vacante}</TableCell>
                  <TableCell><Badge variant="secondary">{c.grado}</Badge></TableCell>
                  <TableCell>{c.exp} años</TableCell>
                  <TableCell>
                    <Badge className={c.presupuesto === 'Excede' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-green-100 text-green-700 hover:bg-green-100'}>
                      {c.presupuesto === 'Excede' ? '⚠️ Excede' : '✅ En Banda'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600">Ver Perfil</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PANEL LATERAL DE DETALLE Y EDICIÓN (Punto 6) * /}
      <Sheet open={!!selectedCandidato} onOpenChange={() => setSelectedCandidato(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-2xl text-blue-900">Perfil del Candidato</SheetTitle>
            <SheetDescription>Toda la información registrada para este proceso.</SheetDescription>
          </SheetHeader>
          
          {selectedCandidato && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase text-slate-500">Información General</h4>
                  <Button variant="outline" size="sm" className="flex gap-2">
                    <Edit className="h-4 w-4" /> Editar Datos
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-500">DNI</p><p className="font-medium">{selectedCandidato.dni}</p></div>
                  <div><p className="text-slate-500">Sede</p><p className="font-medium">{selectedCandidato.sede}</p></div>
                  <div className="col-span-2"><p className="text-slate-500">Vacante</p><p className="font-medium">{selectedCandidato.vacante}</p></div>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-bold uppercase text-slate-500">Perfil Académico</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-500">Grado</p><p className="font-medium">{selectedCandidato.grado}</p></div>
                  <div><p className="text-slate-500">Estado</p><p className="font-medium">{selectedCandidato.estadoEstudio}</p></div>
                  <div className="col-span-2"><p className="text-slate-500">Carrera</p><p className="font-medium">{selectedCandidato.carrera}</p></div>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-bold uppercase text-slate-500">Experiencia Laboral</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-500">Años Experiencia</p><p className="font-medium">{selectedCandidato.exp} años</p></div>
                  <div><p className="text-slate-500">Último Cargo</p><p className="font-medium">{selectedCandidato.ultimoCargo}</p></div>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-bold uppercase text-slate-500">Compensación</h4>
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Expectativa Salarial</p>
                    <p className="text-lg font-bold text-blue-900">S/ {selectedCandidato.expectativa}</p>
                  </div>
                  <Badge className={selectedCandidato.presupuesto === 'Excede' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                    {selectedCandidato.presupuesto} Presupuesto
                  </Badge>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2"><FileText className="h-4 w-4"/> Observaciones</h4>
                <p className="text-sm text-slate-700 italic bg-amber-50 p-3 rounded-md border border-amber-100">
                  {selectedCandidato.observaciones}
                </p>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

*/
