// src/services/turnoService.js
// ============================================================
// Sprint 3 — se agrega cancelar() para CU-02
// NO se modificaron solicitar(), confirmar(), listar() — son de Alex
// ============================================================
import axiosInstance from './axiosInstance'

export const turnoService = {

  // ── De Alex (Sprint 3) — NO TOCAR ────────────────────────────────────────
  solicitar: async (pacienteId, medicoId, fecha, hora) => {
    const response = await axiosInstance.post('/api/turnos/solicitar', {
      pacienteId,
      medicoId,
      fecha,
      hora,
    })
    return response.data
  },

  confirmar: async (turnoId) => {
    const response = await axiosInstance.post(`/api/turnos/${turnoId}/confirmar`)
    return response.data
  },

  listar: async (pacienteId) => {
    const response = await axiosInstance.get(`/api/turnos?pacienteId=${pacienteId}`)
    return response.data
  },

  // ── De Luciana (Sprint 3) — CU-02 Cancelar Turno ─────────────────────────
  // DELETE /api/turnos/{id}
  // 200 → cancelado | 403 → no autorizado | 404 → no existe
  // 409 → ya cancelado | 422 → menos de 2h de anticipación
  cancelar: async (turnoId) => {
    const response = await axiosInstance.delete(`/api/turnos/${turnoId}`)
    return response.data
  },
}