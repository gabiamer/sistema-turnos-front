// src/utils/fecha.js

/**
 * Devuelve el lunes de la semana a la que pertenece `fecha`.
 * @param {Date} fecha
 * @returns {Date}
 */
export function getLunes(fecha = new Date()) {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Devuelve el lunes de la semana actual + offset en semanas, como string ISO.
 * @param {number} offset
 * @returns {string} 'YYYY-MM-DD'
 */
export function getLunesStr(offset = 0) {
  const d = getLunes()
  d.setDate(d.getDate() + offset * 7)
  return toISO(d)
}

/**
 * Convierte un Date a string 'YYYY-MM-DD'.
 * @param {Date} fecha
 * @returns {string}
 */
export function toISO(fecha) {
  return fecha.toISOString().split('T')[0]
}