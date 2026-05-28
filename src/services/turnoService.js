import axiosInstance from './axiosInstance'

export const turnoService = {

  // ── Paciente ─────────────────────────────────────────────────────────────

  // POST /api/turnos/solicitar → { turnoId, bloqueoExpira }
  solicitar: async (pacienteId, medicoId, fecha, hora) => {
    const response = await axiosInstance.post('/api/turnos/solicitar', {
      pacienteId, medicoId, fecha, hora,
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

  // DELETE /api/turnos/{id} — el PACIENTE cancela (requiere pacienteId)
  // 403 si el turno no es del paciente · 422 si < 2h antes
  cancelar: async (turnoId, pacienteId, motivo = '') => {
    const response = await axiosInstance.delete(`/api/turnos/${turnoId}`, {
      data: { pacienteId, motivo },
    })
    return response.data
  },

  // ── Médico ────────────────────────────────────────────────────────────────

  // PATCH /api/turnos/{id}/estado → { estado: "CONCLUIDA" }
  patchEstado: async (turnoId, estado) => {
    const response = await axiosInstance.patch(`/api/turnos/${turnoId}/estado`, { estado })
    return response.data
  },

  // PUT /api/turnos/{id}/reprogramar → { nuevaFecha, nuevaHora }
  // 409 si slot ocupado o paciente tiene turno ese día · 404 si no existe
  putReprogramar: async (turnoId, nuevaFecha, nuevaHora) => {
    const response = await axiosInstance.put(`/api/turnos/${turnoId}/reprogramar`, {
      nuevaFecha,
      nuevaHora,
    })
    return response.data
  },

  // DELETE /api/turnos/{id}/medico — el MÉDICO cancela (sin pacienteId)
  // FIX: usa el endpoint /medico que no requiere validación de ownership
  // body: { motivoCancelacion, canales }
  cancelarMedico: async (turnoId, motivoCancelacion, canales = []) => {
    const response = await axiosInstance.delete(`/api/turnos/${turnoId}/medico`, {
      data: { motivoCancelacion, canales },
    })
    return response.data
  },

  // GET /api/turnos?medicoId= (si el back lo soporta en el futuro)
  listarPorMedico: async (medicoId) => {
    const response = await axiosInstance.get(`/api/turnos?medicoId=${medicoId}`)
    return response.data
  },
}