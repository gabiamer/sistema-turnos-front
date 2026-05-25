// src/services/disponibilidadService.js
import axiosInstance from './axiosInstance'
import { generarSlotsMock } from '../data/mockData'

// ← Cambiá a false cuando Alex confirme que el endpoint está arriba
const USAR_MOCK = true

function getLunesStr(offset = 0) {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff + offset * 7)
  return hoy.toISOString().split('T')[0]
}

export const disponibilidadService = {

  // GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
  getSlots: async (medicoId, semanaOffset = 0) => {
    if (USAR_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      const semana = getLunesStr(semanaOffset)
      const lunes = new Date(semana + 'T12:00:00')
      return generarSlotsMock(medicoId, lunes)
    }

    const semana = getLunesStr(semanaOffset)
    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/disponibilidad?semana=${semana}`
    )
    return response.data
  }
}