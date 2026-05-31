// src/facades/adminFacade.js
// Patrón Facade — orquesta múltiples llamadas al adminService y centraliza
// la normalización de datos, liberando al componente de esa responsabilidad.

import { adminService } from '../services/adminService'

// Strategy de normalización por tipo de reporte (OCP: agregar tipo = agregar entrada)
const NORMALIZADORES = {
  ocupacion:      (item) => ({
    'Médico':       item.nombreMedico,
    'Especialidad': item.especialidad,
    'Total Slots':  item.totalSlots,
    'Ocupados':     item.ocupados,
    '% Ocupación':  item.porcentaje?.toFixed(1) + '%',
  }),
  ausentismo:     (item) => ({
    'ID':           item.turnoId,
    'Fecha':        item.fecha,
    'Médico':       item.nombreMedico,
    'Especialidad': item.especialidad,
  }),
  especialidades: (item) => ({
    'Especialidad': item.especialidad,
    'Total Turnos': item.totalTurnos,
  }),
  cancelaciones:  (item) => ({
    'ID':           item.turnoId,
    'Fecha':        item.fecha,
    'Especialidad': item.especialidad,
    'Paciente':     item.pacienteAnonimizado,
    'Motivo':       item.motivo,
  }),
}

export const adminFacade = {

  cargarKpis: async () => {
    return adminService.getKpis()
  },

  cargarReporte: async (tipo, inicio, fin) => {
    const data = await adminService.getReporte(tipo, inicio, fin)
    const normalizador = NORMALIZADORES[tipo]
    const filas = Array.isArray(data) && normalizador
      ? data.map(normalizador)
      : []
    return filas
  },

  exportar: (tipo, inicio, fin) => {
    return adminService.exportarCSV(tipo, inicio, fin)
  },
}
