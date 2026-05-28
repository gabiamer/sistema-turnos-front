// src/services/medicoService.js
// ============================================================
// Sprint 2 — feature/luci-s2-slots-ui
// Se agrega getByEspecialidad() — NO se modifica getAll() de Alex
// ============================================================
import axiosInstance from './axiosInstance'

export const medicoService = {

  // ── De Alex — NO TOCAR ────────────────────────────────────────────────────
  getAll: async () => {
    const response = await axiosInstance.get('/api/medicos')
    return response.data
  },

  // ── De Luciana (S2) ───────────────────────────────────────────────────────
  // GET /api/medicos?especialidad=Cardiología
  // → [{ id, nombre, apellido, especialidad, email }]
  getByEspecialidad: async (especialidad) => {
    const response = await axiosInstance.get('/api/medicos', {
      params: { especialidad },
    })
    return response.data
  },
}