// src/services/secretariaService.js — Luciana S5
// Usa apiPersonal (ya creado) que inyecta X-User-Role automáticamente desde personalStore
import apiPersonal from './apiPersonal'

export const secretariaService = {

  // GET /api/secretaria/pacientes?q=  (mín 2 chars)
  buscarPaciente: async (q) => {
    const { data } = await apiPersonal.get('/api/secretaria/pacientes', { params: { q } })
    return data
  },

  // POST /api/secretaria/pacientes → 201 | 409 CI duplicado
  registrarPaciente: async (pacienteData) => {
    const { data } = await apiPersonal.post('/api/secretaria/pacientes', pacienteData)
    return data
  },

  // POST /api/secretaria/turnos → 201 CONFIRMADO | 422 duplicado ese día
  // body: { pacienteId, medicoId, fecha, hora }
  // recepcionistaId lo agrega el interceptor vía personalStore (el back lo lee del header)
  agendarTurno: async (body) => {
    const { data } = await apiPersonal.post('/api/secretaria/turnos', body)
    return data
  },

  // DELETE /api/secretaria/turnos/{id} → 204
  // body: { motivo }
  cancelarTurno: async (id, body) => {
    const { data } = await apiPersonal.delete(`/api/secretaria/turnos/${id}`, { data: body })
    return data
  },

  // GET /api/secretaria/turnos/hoy → [AgendaSlotDTO]
  getTurnosHoy: async () => {
    const { data } = await apiPersonal.get('/api/secretaria/turnos/hoy')
    return data
  },
}