// src/services/disponibilidadService.js
import axiosInstance from './axiosInstance'
import { getLunesStr } from '../utils/fecha'

export const disponibilidadService = {

  /**
   * GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
   *
   * param {number} medicoId
   * param {number|string} semana - puede ser:
   *   - un número entero (offset de semanas respecto a la actual, usado en CalendarioPage)
   *   - un string ISO 'YYYY-MM-DD' con la fecha del lunes (usado en BuscarMedico)
   *
   * Retorna: [{ fecha, hora, disponible, bloqueado }]
   */
  getSlots: async (medicoId, semana = 0) => {
    const fechaSemana = typeof semana === 'number'
      ? getLunesStr(semana)
      : semana

    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/disponibilidad?semana=${fechaSemana}`
    )
    return response.data
  },
}