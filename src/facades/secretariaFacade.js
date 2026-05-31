// src/facades/secretariaFacade.js
// Patrón Facade — orquesta operaciones de secretaría y centraliza
// cálculos de KPIs de la agenda, liberando al componente de esa lógica.

import { secretariaService } from '../services/secretariaService'

export const secretariaFacade = {

  cargarAgendaHoy: async () => {
    const data = await secretariaService.getTurnosHoy()
    const turnos = Array.isArray(data) ? data : []
    return {
      turnos,
      kpis: {
        total:       turnos.length,
        confirmados: turnos.filter(t => t.estado === 'CONFIRMADO').length,
        pendientes:  turnos.filter(t => t.estado === 'PENDIENTE').length,
      },
    }
  },

  buscarPaciente: (q) => secretariaService.buscarPaciente(q),

  registrarPaciente: (datos) => secretariaService.registrarPaciente(datos),

  agendarTurno: (body) => secretariaService.agendarTurno(body),

  cancelarTurno: (id, motivo) => secretariaService.cancelarTurno(id, { motivo }),
}
