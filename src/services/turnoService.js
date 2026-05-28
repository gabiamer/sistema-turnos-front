import axiosInstance from './axiosInstance'

export const turnoService = {

  // POST /api/turnos/solicitar → { turnoId, bloqueoExpira }
  solicitar: async (pacienteId, medicoId, fecha, hora) => {
    const response = await axiosInstance.post('/api/turnos/solicitar', {
      pacienteId,
      medicoId,
      fecha,
      hora,
    })
    return response.data
  },

  // POST /api/turnos/{id}/confirmar → Turno confirmado
  confirmar: async (turnoId) => {
    const response = await axiosInstance.post(`/api/turnos/${turnoId}/confirmar`)
    return response.data
  },

  // GET /api/turnos?pacienteId= → lista de turnos del paciente
  listar: async (pacienteId) => {
    const response = await axiosInstance.get(`/api/turnos?pacienteId=${pacienteId}`)
    return response.data
  },

  // DELETE /api/turnos/{id} → { message: "Turno cancelado" }
  // 403 si el turno no pertenece al paciente
  // 422 si faltan menos de 2 horas para el turno
  cancelar: async (turnoId, pacienteId, motivo = '') => {
    const response = await axiosInstance.delete(`/api/turnos/${turnoId}`, {
      data: { pacienteId, motivo },
    })
    return response.data
  },
}