// src/repositories/turnoRepository.js
// Puerto de salida (capa de aplicación) — abstrae el acceso a datos de Turno.
// Los componentes dependen de esta interfaz, no de servicios HTTP directamente.

import { turnoService }  from '../services/turnoService'
import { turnoAdapter }  from '../adapters/turnoAdapter'

export const turnoRepository = {

  listarPorPaciente: async (pacienteId) => {
    const data = await turnoService.listar(pacienteId)
    return turnoAdapter.listFromDTO(data)
  },

  solicitar: async (pacienteId, medicoId, fecha, hora) => {
    return turnoService.solicitar(pacienteId, medicoId, fecha, hora)
  },

  confirmar: async (turnoId) => {
    return turnoService.confirmar(turnoId)
  },

  cancelarComoPaciente: async (turnoId, pacienteId, motivo = '') => {
    return turnoService.cancelar(turnoId, pacienteId, motivo)
  },

  actualizarEstado: async (turnoId, estado) => {
    return turnoService.patchEstado(turnoId, estado)
  },

  reprogramar: async (turnoId, nuevaFecha, nuevaHora) => {
    return turnoService.putReprogramar(turnoId, nuevaFecha, nuevaHora)
  },

  cancelarComoMedico: async (turnoId, motivo, canales = []) => {
    return turnoService.cancelarMedico(turnoId, motivo, canales)
  },
}
