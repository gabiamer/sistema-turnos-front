// ============================================================
// disponibilidadService.js — Luciana Sprint 2
// GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
// USAR_MOCK = true  → datos de prueba (no necesita backend)
// USAR_MOCK = false → endpoint real (cuando Alex lo confirme)
// ============================================================
import { generarSlotsMock } from '../data/mockData'

const USAR_MOCK = true

function getLunesStr(offset = 0) {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff + offset * 7)
  return hoy.toISOString().split('T')[0]
}

export async function getDisponibilidad(medicoId, semanaOffset = 0) {
  const semana = getLunesStr(semanaOffset)

  if (USAR_MOCK) {
    await new Promise(r => setTimeout(r, 600))
    const lunes = new Date(semana + 'T12:00:00')
    return generarSlotsMock(medicoId, lunes)
  }

  const res = await fetch(
    `/api/medicos/${medicoId}/disponibilidad?semana=${semana}`
  )
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}