import axiosInstance from './axiosInstance'


const USAR_MOCK = false

// Devuelve lunes según offset
function getLunesDesdeOffset(offset = 0) {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia

  hoy.setDate(hoy.getDate() + diff + offset * 7)

  return hoy.toISOString().split('T')[0]
}

// Acepta:
// getSlots(1, 0)
// getSlots(1, '2026-05-26')
function resolverSemana(semanaArg) {

  // Adri manda string ISO
  if (
    typeof semanaArg === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(semanaArg)
  ) {
    return semanaArg
  }

  // CalendarioPage manda offset
  return getLunesDesdeOffset(Number(semanaArg) || 0)
}

export const disponibilidadService = {

  getSlots: async (medicoId, semanaArg = 0) => {

    const semana = resolverSemana(semanaArg)

    // SOLO backend real
    const response = await axiosInstance.get(
      `/api/medicos/${medicoId}/disponibilidad`,
      {
        params: { semana }
      }
    )

    // backend puede devolver:
    // { slots: [...] }
    // o directamente [...]
    return Array.isArray(response.data)
      ? response.data
      : response.data.slots ?? []
  },
}