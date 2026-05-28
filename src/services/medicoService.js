import axiosInstance from './axiosInstance'

export const medicoService = {

  // GET /api/medicos → lista completa (o filtrada por especialidad)
  getAll: async (especialidad = null) => {
    const params = especialidad ? `?especialidad=${especialidad}` : ''
    const response = await axiosInstance.get(`/api/medicos${params}`)
    return response.data
  },

  // GET /api/medicos/{id} → un médico por id
  getById: async (id) => {
    const response = await axiosInstance.get(`/api/medicos/${id}`)
    return response.data
  },
}