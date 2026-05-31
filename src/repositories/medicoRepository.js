// src/repositories/medicoRepository.js
// Puerto de salida — abstrae el acceso a datos de Medico y Slot de agenda.

import { medicoService } from '../services/medicoService'
import { agendaService } from '../services/agendaService'
import { medicoAdapter } from '../adapters/medicoAdapter'
import { slotAdapter }   from '../adapters/slotAdapter'

export const medicoRepository = {

  getAll: async (especialidad = null) => {
    const data = await medicoService.getAll(especialidad)
    return medicoAdapter.listFromDTO(data)
  },

  getById: async (id) => {
    const data = await medicoService.getById(id)
    return medicoAdapter.fromDTO(data)
  },

  buscarPorCi: async (ci) => {
    const data = await medicoService.buscarPorCi(ci)
    return medicoAdapter.fromDTO(data)
  },

  getDisponibilidad: async (medicoId, semana) => {
    const data = await medicoService.getDisponibilidad(medicoId, semana)
    return slotAdapter.listFromDTO(data)
  },

  getAgendaSemana: async (medicoId, semana) => {
    const data = await medicoService.getAgendaSemana(medicoId, semana)
    return slotAdapter.listFromDTO(data)
  },

  getAgenda: async (medicoId) => {
    return agendaService.getByMedico(medicoId)
  },

  actualizarAgenda: async (medicoId, dias) => {
    return agendaService.actualizarAgenda(medicoId, dias)
  },

  getBloqueos: async (medicoId) => {
    return agendaService.getBloqueos(medicoId)
  },

  crearBloqueo: async (medicoId, bloqueo) => {
    return agendaService.crearBloqueo(medicoId, bloqueo)
  },
}
