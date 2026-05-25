// ============================================================
// disponibilidadService.js — Luciana Sprint 2
// Conecta con GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
// Mientras el endpoint no esté listo → usa mock automáticamente
// Cuando Alex suba el endpoint: cambiar USAR_MOCK a false
// ============================================================
import { generarSlotsMock } from '../data/mockData'

// ← Cambiá esto a false cuando Alex confirme que el endpoint está arriba
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
    // Simula delay de red para que el spinner se vea
    await new Promise(r => setTimeout(r, 600))
    const lunes = new Date(semana + 'T12:00:00')
    return generarSlotsMock(medicoId, lunes)
  }

  // Endpoint real — se activa cuando USAR_MOCK = false
  const res = await fetch(
    `/api/medicos/${medicoId}/disponibilidad?semana=${semana}`
  )
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
