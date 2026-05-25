// src/services/turnoService.js
import axiosInstance from './axiosInstance'

export const turnoService = {

  // POST /api/turnos/solicitar  → devuelve { turnoId, bloqueoExpira }
  solicitar: async (medicoId, fecha, hora) => {
    const response = await axiosInstance.post('/api/turnos/solicitar', {
      medicoId,
      fecha,
      hora,
    })
    return response.data
  },

  // POST /api/turnos/{id}/confirmar
  confirmar: async (turnoId) => {
    const response = await axiosInstance.post(`/api/turnos/${turnoId}/confirmar`)
    return response.data
  },
}