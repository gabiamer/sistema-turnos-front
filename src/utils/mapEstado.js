// src/utils/mapEstado.js
// Patrón OCP — colores light theme.

export const MAP_ESTADO = {
  PENDIENTE: {
    label: 'Pendiente',
    bg: '#fffbeb', border: '#fde68a', color: '#d97706',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    bg: '#f0fdf4', border: '#86efac', color: '#16a34a',
  },
  PROGRAMADA: {
    label: 'Programada',
    bg: '#f0fdf4', border: '#86efac', color: '#16a34a',
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    bg: '#faf5ff', border: '#e9d5ff', color: '#7c3aed',
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: '#fef2f2', border: '#fecaca', color: '#dc2626',
  },
  CONCLUIDA: {
    label: 'Concluida',
    bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8',
  },
  EXPIRADO: {
    label: 'Expirado',
    bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8',
  },
}

const FALLBACK = { label: 'Desconocido', bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8' }

export function getEstiloEstado(estado) {
  return MAP_ESTADO[estado] ?? FALLBACK
}