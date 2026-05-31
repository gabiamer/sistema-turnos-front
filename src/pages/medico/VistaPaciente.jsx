// src/pages/medico/VistaPaciente.jsx
// Mis Turnos del paciente — estética editorial pastel.
// Lee pacienteId de sessionStorage (guardado en LoginPage tras buscar por CI).

import { useState, useEffect, useCallback } from 'react'
import { turnoService }    from '../../services/turnoService'
import { getEstiloEstado } from '../../utils/mapEstado'
import Toast               from '../../components/medico/Toast'
import { Spinner, BannerError } from './VistaMedico'

const CANCELABLES = new Set(['CONFIRMADO', 'PENDIENTE', 'PROGRAMADA', 'BLOQUEADO'])

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

export default function VistaPaciente() {
  const [paciente, setPaciente]           = useState(null)
  const [turnos, setTurnos]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [expandido, setExpandido]         = useState(null)
  const [cancelando, setCancelando]       = useState(null)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [errorCancel, setErrorCancel]     = useState('')
  const [toast, setToast]                 = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('paciente')
    if (stored) {
      try { setPaciente(JSON.parse(stored)) } catch { /* corrupto */ }
    }
    setLoading(false)
  }, [])

  const cargarTurnos = useCallback(() => {
    if (!paciente?.id) return
    setLoading(true); setError('')
    turnoService.listar(paciente.id)
      .then(data => setTurnos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los turnos. Verifica tu conexión e intenta de nuevo.'))
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
      setErrorCancel(
        err.response?.status === 422 ? 'No se puede cancelar con menos de 2 horas de anticipación.'
        : err.response?.status === 403 ? 'No estás autorizado para cancelar este turno.'
        : 'Error al cancelar. Intentá de nuevo.'
      )
    } finally { setLoadingCancel(false) }
  }

  const turnosActivos   = turnos.filter(t => CANCELABLES.has(t.estado))
  const turnosHistorial = turnos.filter(t => !CANCELABLES.has(t.estado))

  if (!loading && !paciente) {
    return (
      <Contenedor>
        <style>{fontImport}</style>
        <Header titulo="Mis Turnos" />
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-texto-muted)' }}>
          <p style={{ marginBottom: 10 }}>No hay sesión activa.</p>
          <a href="/login" className="btn btn--primario" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Iniciar sesión →
          </a>
        </div>
      </Contenedor>
    )
  }

  if (loading) return <Contenedor><style>{fontImport}</style><Spinner label="Cargando turnos..." /></Contenedor>

  if (error) return (
    <Contenedor>
      <style>{fontImport}</style>
      <Header titulo="Mis Turnos" />
      <BannerError mensaje={error} onReintentar={cargarTurnos} />
    </Contenedor>
  )

  return (
    <Contenedor>
      <style>{`
        ${fontImport}
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      <Header
        titulo="Mis Turnos"
        sub={paciente ? `${paciente.nombre} ${paciente.apellido} · CI ${paciente.ci}` : null}
      />

      {turnos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-texto-muted)', fontSize: 14 }}>
          No tenés turnos agendados aún.
        </div>
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

      {/* ── Modal cancelar ── */}
      {cancelando && (
        <div
          onClick={() => setCancelando(null)}
          className="modal-overlay"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="modal-contenido"
            style={{ maxWidth: 400, padding: '24px 28px' }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--color-texto)', margin: '0 0 6px' }}>
              ¿Cancelar turno?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-texto-muted)', marginBottom: 20 }}>
              Solo podés cancelar hasta 2 horas antes del turno.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-texto-suave)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Motivo
              </label>
              <input
                type="text"
                value={cancelando.motivo}
                onChange={e => { setCancelando(p => ({ ...p, motivo: e.target.value })); setErrorCancel('') }}
                placeholder="Ej: no puedo asistir"
                className="input-base"
              />
            </div>

            {errorCancel && (
              <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>⚠ {errorCancel}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setCancelando(null)}
                className="btn btn--ghost"
                style={{ flex: 1 }}
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                disabled={loadingCancel}
                className="btn btn--danger"
                style={{ flex: 1, opacity: loadingCancel ? 0.6 : 1, cursor: loadingCancel ? 'not-allowed' : 'pointer' }}
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
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        onClick={onExpandir}
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-texto)', marginBottom: 2, fontSize: 14, fontFamily: 'var(--font-display)' }}>
            Dr/a. {turno.medico?.nombre} {turno.medico?.apellido}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-texto-suave)' }}>{turno.medico?.especialidad}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span className={`chip chip--${e.label.toLowerCase()}`} style={{
            background: e.bg, border: `1px solid ${e.border}`, color: e.color
          }}>
            {e.label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-texto-hint)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {formatearFecha(turno.fecha)} · {turno.hora}
          </span>
        </div>
        <span style={{ color: 'var(--color-texto-hint)', fontSize: 12, flexShrink: 0 }}>{expandido ? '▲' : '▼'}</span>
      </div>

      {expandido && (
        <div style={{
          padding:     '14px 18px',
          borderTop:   '1px solid var(--color-borde-suave)',
          background:  'rgba(255,255,255,0.5)',
          display:     'flex',
          flexDirection:'column',
          gap:          12,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <DetalleItem label="Fecha"        value={formatearFecha(turno.fecha)} />
            <DetalleItem label="Hora"         value={turno.hora} mono />
            <DetalleItem label="Especialidad" value={turno.medico?.especialidad} />
            <DetalleItem label="Estado"       value={e.label} />
          </div>
          {turno.motivoCancelacion && (
            <DetalleItem label="Motivo cancelación" value={turno.motivoCancelacion} />
          )}
          {cancelable && onCancelar && (
            <button
              onClick={ev => { ev.stopPropagation(); onCancelar() }}
              className="btn btn--danger"
              style={{ alignSelf: 'flex-start' }}
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
      <p style={{ fontSize: 10, color: 'var(--color-texto-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-texto)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

function Contenedor({ children }) {
  return (
    <div style={{
      maxWidth:   640,
      margin:     '0 auto',
      padding:    '28px 16px 56px',
      fontFamily: 'var(--font-body)',
    }}>
      {children}
    </div>
  )
}

function Header({ titulo, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{
        fontFamily:    'var(--font-display)',
        fontSize:      22,
        fontWeight:    400,
        color:         'var(--color-texto)',
        margin:        0,
        letterSpacing: '-0.01em',
      }}>
        {titulo}
      </h1>
      {sub && <p style={{ fontSize: 12, color: 'var(--color-texto-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>{titulo}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return fechaStr }
}