/** Contenido de CV de demostración por id de candidato (mock). */
export type CandidateCvProfile = {
  email: string;
  telefono: string;
  resumen: string;
  experiencia: string[];
  educacion: string[];
};

export const mockCandidateCvProfiles: Record<string, CandidateCvProfile> = {
  c1: {
    email: "r.huaman@email.com",
    telefono: "+51 987 112 334",
    resumen:
      "Ingeniera industrial con 8 años en manufactura y supervisión de líneas. Liderazgo de equipos de 20+ personas en entornos de alta rotación.",
    experiencia: [
      "Supervisora de producción — Industria del norte (2019–actualidad)",
      "Analista de procesos — Planta textil (2016–2019)",
    ],
    educacion: [
      "Ingeniería Industrial — Universidad Nacional de Ingeniería",
      "Diplomado en Lean Manufacturing — ESAN",
    ],
  },
  c2: {
    email: "j.chiroque@email.com",
    telefono: "+51 956 778 901",
    resumen:
      "Especialista en logística de distribución y planificación de rutas. Uso de WMS y coordinación con área comercial.",
    experiencia: [
      "Coordinador de despacho — Operador logístico regional (2020–actualidad)",
      "Auxiliar de almacén — Cadena retail (2017–2020)",
    ],
    educacion: [
      "Técnico en Logística — SENATI",
      "Curso de Excel avanzado — Cámara de Comercio",
    ],
  },
  c3: {
    email: "f.nieto@email.com",
    telefono: "+51 923 445 667",
    resumen:
      "Profesional en transición con fuerte orientación a resultados. Experiencia en atención al cliente B2B y control de calidad básico.",
    experiencia: [
      "Supervisora de calidad — Planta industrial (2021–2023)",
      "Practica profesional — Producción en línea (2020)",
    ],
    educacion: [
      "Ingeniería Industrial — Universidad de Piura",
    ],
  },
  c4: {
    email: "m.bazan@email.com",
    telefono: "+51 978 334 221",
    resumen:
      "Ingeniero mecánico con experiencia en mantenimiento preventivo y correctivo de planta. Disponibilidad para campamento.",
    experiencia: [
      "Supervisor de mantenimiento — Minería contratista (2018–actualidad)",
      "Técnico mecánico — Servicios industriales (2014–2018)",
    ],
    educacion: [
      "Ingeniería Mecánica — Universidad Nacional Pedro Ruiz Gallo",
    ],
  },
  c5: {
    email: "p.delgado@email.com",
    telefono: "+51 944 556 778",
    resumen:
      "Analista de planificación y control con dominio de ERP y reportes. Enfoque en optimización de inventarios y forecast.",
    experiencia: [
      "Analista de planificación — Retail nacional (2019–actualidad)",
      "Asistente de planificación — Distribuidora (2016–2019)",
    ],
    educacion: [
      "Administración — Universidad del Pacífico",
      "Certificación en Supply Chain — APICS (en curso)",
    ],
  },
  c6: {
    email: "e.farro@email.com",
    telefono: "+51 965 123 889",
    resumen:
      "Operador logístico con experiencia en recepción, despacho y inventarios cíclicos. Carné de conducir clase A.",
    experiencia: [
      "Auxiliar de logística — Operador portuario (2022–actualidad)",
      "Ayudante de almacén — Agroindustria (2019–2022)",
    ],
    educacion: [
      "Educación secundaria completa",
      "Curso de seguridad industrial — Ocupacional",
    ],
  },
};
