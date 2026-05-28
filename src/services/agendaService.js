import axiosInstance from './axiosInstance'

export const agendaService = {

  // GET /api/medicos/{id}/agenda → lista de AgendaMedico activos
  getByMedico: async (medicoId) => {
    const response = await axiosInstance.get(`/api/medicos/${medicoId}/agenda`)
    return response.data
  },

  // PUT /api/medicos/{id}/agenda → reemplaza toda la agenda
  // El backend recibe el array directamente (List<AgendaMedico>)
  // 409 si hay turnos CONFIRMADOS en horarios afectados
  actualizarAgenda: async (medicoId, dias) => {
    const response = await axiosInstance.put(
      `/api/medicos/${medicoId}/agenda`,
      dias   // array directo, NO envolver en { dias }
    )
    return response.data
  },

  // GET /api/medicos/{id}/bloqueos → lista de BloqueoDia del médico
  getBloqueos: async (medicoId) => {
    const response = await axiosInstance.get(`/api/medicos/${medicoId}/bloqueos`)
    return response.data
  },

  // POST /api/medicos/{id}/bloqueos → crea un bloqueo de días
  // 409 si hay turnos CONFIRMADOS en ese rango
  crearBloqueo: async (medicoId, bloqueo) => {
    const response = await axiosInstance.post(
      `/api/medicos/${medicoId}/bloqueos`,
      bloqueo
    )
    return response.data
  },
}