// src/services/disponibilidadService.js
import axiosInstance from './axiosInstance'

export const disponibilidadService = {

  // GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
  // semana = lunes de la semana que queremos consultar
  getSlots: async (medicoId, semana) => {
    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/disponibilidad?semana=${semana}`
    )
    return response.data
  }
}