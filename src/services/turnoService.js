import axiosInstance from './axiosInstance'

export const turnoService = {

  solicitar: async (pacienteId, medicoId, fecha, hora) => {
    const response = await axiosInstance.post('/api/turnos/solicitar', {
      pacienteId,
      medicoId,
      fecha,
      hora,
    })
    return response.data
  },

  confirmar: async (turnoId) => {
    const response = await axiosInstance.post(`/api/turnos/${turnoId}/confirmar`)
    return response.data
  },

  listar: async (pacienteId) => {
    const response = await axiosInstance.get(`/api/turnos?pacienteId=${pacienteId}`)
    return response.data
  },
}