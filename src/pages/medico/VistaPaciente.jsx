// src/pages/medico/VistaPaciente.jsx
// Mis Turnos del paciente — light theme.
// Lee pacienteId de sessionStorage (guardado en LoginPage tras buscar por CI).
// Llama a GET /api/turnos?pacienteId= real.

import { useState, useEffect, useCallback } from 'react'
import { turnoService } from '../../services/turnoService'
import { getEstiloEstado } from '../../utils/mapEstado'
import Toast from '../../components/medico/Toast'

const CANCELABLES = new Set(['CONFIRMADO', 'PENDIENTE', 'PROGRAMADA', 'BLOQUEADO'])

export default function VistaPaciente() {
  const [paciente, setPaciente]           = useState(null)
  const [turnos, setTurnos]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [expandido, setExpandido]         = useState(null)
  const [cancelando, setCancelando]       = useState(null)  // { turnoId, motivo }
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [errorCancel, setErrorCancel]     = useState('')
  const [toast, setToast]                 = useState(null)

  // Leer paciente de sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('paciente')
    if (stored) {
      try {
        const p = JSON.parse(stored)
        setPaciente(p)
      } catch { /* sessionStorage corrupto */ }
    }
    setLoading(false)
  }, [])

  const cargarTurnos = useCallback(() => {
    if (!paciente?.id) return
    setLoading(true); setError('')
    turnoService.listar(paciente.id)
      .then(data => setTurnos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los turnos. Verificá tu conexión e intentá de nuevo.'))
      .finally(() => setLoading(false))
  }, [paciente])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  async function handleCancelar() {
    if (!cancelando) return
    if (!cancelando.motivo.trim()) { setErrorCancel('El motivo es requerido.'); return }
    setLoadingCancel(true); setErrorCancel('')
    try {
      await turnoService.cancelar(cancelando.turnoId, paciente.id, cancelando.motivo)
      setTurnos(prev => prev.map(t =>
        t.id === cancelando.turnoId
          ? { ...t, estado: 'CANCELADO', motivoCancelacion: cancelando.motivo }
          : t
      ))
      setCancelando(null)
      setToast({ mensaje: 'Turno cancelado correctamente.', tipo: 'ok' })
    } catch (err) {
      if (err.response?.status === 422)
        setErrorCancel('No se puede cancelar con menos de 2 horas de anticipación.')
      else if (err.response?.status === 403)
        setErrorCancel('No estás autorizado para cancelar este turno.')
      else
        setErrorCancel('Error al cancelar. Intentá de nuevo.')
    } finally { setLoadingCancel(false) }
  }

  const turnosActivos   = turnos.filter(t => CANCELABLES.has(t.estado))
  const turnosHistorial = turnos.filter(t => !CANCELABLES.has(t.estado))

  // ── Sin sesión ─────────────────────────────────────────────────────────────
  if (!loading && !paciente) {
    return (
      <Contenedor>
        <Header titulo="Mis Turnos" />
        <div style={cardVacioStyle}>
          <p style={{ marginBottom: 8 }}>No hay sesión activa.</p>
          <a href="/login" style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>
            → Ir a iniciar sesión
          </a>
        </div>
      </Contenedor>
    )
  }

  if (loading) return <Contenedor><Spinner /></Contenedor>

  if (error) return (
    <Contenedor>
      <Header titulo="Mis Turnos" />
      <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
        ⚠ {error}
        <button onClick={cargarTurnos} style={{ marginLeft: 'auto', background: 'white', border: '1px solid #fca5a5', borderRadius: 6, color: '#dc2626', fontSize: 12, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Reintentar
        </button>
      </div>
    </Contenedor>
  )

  return (
    <Contenedor>
      <Header
        titulo="Mis Turnos"
        sub={paciente ? `${paciente.nombre} ${paciente.apellido} · CI ${paciente.ci}` : null}
      />

      {turnos.length === 0 && (
        <div style={cardVacioStyle}>No tenés turnos agendados aún.</div>
      )}

      {turnosActivos.length > 0 && (
        <Seccion titulo="Próximos">
          {turnosActivos.map(t => (
            <TarjetaTurno
              key={t.id}
              turno={t}
              expandido={expandido === t.id}
              onExpandir={() => setExpandido(p => p === t.id ? null : t.id)}
              onCancelar={() => { setCancelando({ turnoId: t.id, motivo: '' }); setErrorCancel('') }}
            />
          ))}
        </Seccion>
      )}

      {turnosHistorial.length > 0 && (
        <Seccion titulo="Historial">
          {turnosHistorial.map(t => (
            <TarjetaTurno
              key={t.id}
              turno={t}
              expandido={expandido === t.id}
              onExpandir={() => setExpandido(p => p === t.id ? null : t.id)}
            />
          ))}
        </Seccion>
      )}

      {/* Modal cancelar paciente */}
      {cancelando && (
        <div
          onClick={() => setCancelando(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 60px rgba(15,23,42,0.12)', animation: 'modalIn 0.2s ease' }}
          >
            <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }`}</style>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>¿Cancelar turno?</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>Solo podés cancelar hasta 2 horas antes del turno.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Motivo (opcional)</label>
              <input
                type="text"
                value={cancelando.motivo}
                onChange={e => { setCancelando(p => ({ ...p, motivo: e.target.value })); setErrorCancel('') }}
                placeholder="Ej: no puedo asistir"
                style={{ padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {errorCancel && <p style={{ fontSize: 12, color: '#dc2626' }}>⚠ {errorCancel}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCancelando(null)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Volver
              </button>
              <button
                onClick={handleCancelar}
                disabled={loadingCancel}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: loadingCancel ? 'not-allowed' : 'pointer', opacity: loadingCancel ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {loadingCancel ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </Contenedor>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function TarjetaTurno({ turno, expandido, onExpandir, onCancelar }) {
  const e = getEstiloEstado(turno.estado)
  const cancelable = CANCELABLES.has(turno.estado)

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
      <div
        onClick={onExpandir}
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2, fontSize: 14 }}>
            Dr/a. {turno.medico?.nombre} {turno.medico?.apellido}
          </p>
          <p style={{ fontSize: 12, color: '#64748b' }}>{turno.medico?.especialidad}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: e.bg, border: `1px solid ${e.border}`, color: e.color, whiteSpace: 'nowrap' }}>
            {e.label}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {formatearFecha(turno.fecha)} · {turno.hora}
          </span>
        </div>
        <span style={{ color: '#cbd5e1', fontSize: 12, flexShrink: 0 }}>{expandido ? '▲' : '▼'}</span>
      </div>

      {expandido && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <DetalleItem label="Fecha" value={formatearFecha(turno.fecha)} />
            <DetalleItem label="Hora" value={turno.hora} mono />
            <DetalleItem label="Especialidad" value={turno.medico?.especialidad} />
            <DetalleItem label="Estado" value={e.label} />
          </div>
          {turno.motivoCancelacion && (
            <DetalleItem label="Motivo cancelación" value={turno.motivoCancelacion} />
          )}
          {cancelable && onCancelar && (
            <button
              onClick={e2 => { e2.stopPropagation(); onCancelar() }}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', fontFamily: 'inherit' }}
            >
              ✕ Cancelar turno
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DetalleItem({ label, value, mono }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'monospace' }}>{label}</p>
      <p style={{ fontSize: 13, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit' }}>{value ?? '—'}</p>
    </div>
  )
}

function Contenedor({ children }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 56px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {children}
    </div>
  )
}

function Header({ titulo, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>{titulo}</h1>
      {sub && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2rem 0', color: '#64748b', fontSize: 13 }}>
      <div style={{ width: 18, height: 18, border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      Cargando turnos...
    </div>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return fechaStr }
}

const cardVacioStyle = {
  padding: '1.75rem',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#64748b',
  fontSize: 14,
  textAlign: 'center',
}