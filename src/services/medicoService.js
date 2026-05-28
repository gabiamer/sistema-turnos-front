import axiosInstance from './axiosInstance'

export const medicoService = {

  // GET /api/medicos → lista completa (o filtrada por especialidad)
  getAll: async (especialidad = null) => {
    const params = especialidad ? `?especialidad=${especialidad}` : ''
    const response = await axiosInstance.get(`/api/medicos${params}`)
    return response.data
  },

  // GET /api/medicos/{id}
  getById: async (id) => {
    const response = await axiosInstance.get(`/api/medicos/${id}`)
    return response.data
  },

  // GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
  // Usado por la vista del paciente (BuscarMedico / CalendarioPage).
  // Devuelve: [{ fecha, hora, disponible, bloqueado }]  — sin datos de turno/paciente.
  getDisponibilidad: async (medicoId, semana) => {
    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/disponibilidad?semana=${semana}`
    )
    return response.data
  },

  // GET /api/medicos/{id}/agenda-semana?semana=YYYY-MM-DD
  // Usado por la vista del médico (VistaMedico).
  // Devuelve slots enriquecidos:
  // [{ fecha, hora, disponible, bloqueado, turno?: { id, estado, paciente: { id, nombre, apellido, ci } } }]
  getAgendaSemana: async (medicoId, semana) => {
    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/agenda-semana?semana=${semana}`
    )
    return response.data
  },
}