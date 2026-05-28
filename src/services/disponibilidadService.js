// src/services/disponibilidadService.js
import axiosInstance from './axiosInstance'

/**
 * Devuelve la fecha del lunes de la semana actual más un offset de semanas.
 * Ej: offset=0 → lunes de esta semana; offset=1 → lunes de la próxima semana.
 */
function getLunesStr(offset = 0) {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff + offset * 7)
  return hoy.toISOString().split('T')[0]
}

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