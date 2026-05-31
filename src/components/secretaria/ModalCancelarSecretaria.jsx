// src/components/secretaria/ModalCancelarSecretaria.jsx — Luciana S5
// DELETE /api/secretaria/turnos/{id} con { motivo }
// Sin regla de 2h (secretaría puede cancelar en cualquier momento)
// Props:
//   turno     { id, fecha, hora, medico: { nombre, apellido }, paciente: { nombre, apellido } }
//   onCerrar()
//   onCancelado() → DashboardSecretaria recarga la tabla del día

import { useState } from 'react'
import { secretariaService } from '../../services/secretariaService'

export default function ModalCancelarSecretaria({ turno, onCerrar, onCancelado }) {
  const [motivo, setMotivo]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const motivoValido = motivo.trim().length >= 10

  async function handleConfirmar() {
    if (!motivoValido) { setError('El motivo debe tener al menos 10 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      await secretariaService.cancelarTurno(turno.id, { motivo: motivo.trim() })
      onCancelado()
      onCerrar()
    } catch (err) {
      if (err.response?.status === 403) setError('No tenés permiso para cancelar este turno.')
      else if (err.response?.status === 404) setError('El turno no existe o ya fue cancelado.')
      else setError('Error al cancelar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => !loading && onCerrar()}
      role="dialog" aria-modal="true" aria-labelledby="modal-csec-titulo"
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '1.75rem', maxWidth: '440px', width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <h3
          id="modal-csec-titulo"
          style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}
        >
          Cancelar turno
        </h3>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '0.9rem', marginBottom: '1.1rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.2rem' }}>
            Dr/a. {turno.medico?.nombre} {turno.medico?.apellido}
          </p>
          {turno.paciente && (
            <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.15rem' }}>
              Paciente: {turno.paciente.nombre} {turno.paciente.apellido}
            </p>
          )}
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {formatearFecha(turno.fecha)} · {turno.hora}
          </p>
        </div>

        <label
          htmlFor="motivo-csec"
          style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.4rem' }}
        >
          Motivo <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          id="motivo-csec"
          value={motivo}
          onChange={e => { setMotivo(e.target.value); setError('') }}
          placeholder="Describí el motivo (mínimo 10 caracteres)…"
          rows={3}
          style={{
            width: '100%', padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: `1px solid ${!motivoValido && motivo.length > 0 ? '#fca5a5' : '#cbd5e1'}`,
            fontSize: '0.875rem', resize: 'vertical',
            outline: 'none', marginBottom: '0.3rem', boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: motivo.trim().length < 10 && motivo.length > 0 ? '#dc2626' : '#94a3b8', marginBottom: '0.9rem' }}>
          {motivo.trim().length} / 10 mín
        </p>

        {error && (
          <div role="alert" style={{
            padding: '0.7rem 0.9rem', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '8px',
            color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.9rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCerrar} disabled={loading}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px',
              border: '1px solid #e2e8f0', backgroundColor: 'white',
              color: '#64748b', fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Volver
          </button>
          <button
            onClick={handleConfirmar} disabled={loading || !motivoValido}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
              backgroundColor: loading || !motivoValido ? '#fca5a5' : '#dc2626',
              color: 'white', fontSize: '0.875rem', fontWeight: '600',
              cursor: loading || !motivoValido ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short',
    })
  } catch { return fechaStr }
}