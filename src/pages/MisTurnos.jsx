// src/pages/MisTurnos.jsx
import { useState, useEffect, useCallback } from 'react'
import { turnoService } from '../services/turnoService'

const ESTADO_COLOR = {
  CONFIRMADO: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  PENDIENTE:  { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  CANCELADO:  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  BLOQUEADO:  { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b' },
  EXPIRADO:   { bg: '#f1f5f9', border: '#cbd5e1', text: '#94a3b8' },
}

const CANCELABLE_STATES = new Set(['CONFIRMADO', 'PENDIENTE', 'BLOQUEADO'])

function MisTurnos() {
  const [paciente, setPaciente]   = useState(null)
  const [turnos, setTurnos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  // Estado para la cancelación
  const [cancelando, setCancelando]         = useState(null)   // turnoId en proceso
  const [motivoCancelacion, setMotivo]      = useState('')
  const [errorCancelacion, setErrorCancel]  = useState('')
  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null) // id del turno que pide confirmación

  // Leer paciente de sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('paciente')
    if (stored) {
      try { setPaciente(JSON.parse(stored)) } catch { /* sessionStorage corrupto */ }
    }
    setLoading(false)
  }, [])

  const cargarTurnos = useCallback(() => {
    if (!paciente?.id) return
    setLoading(true)
    turnoService.listar(paciente.id)
      .then(data => setTurnos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los turnos. Intentá más tarde.'))
      .finally(() => setLoading(false))
  }, [paciente])

  useEffect(() => {
    cargarTurnos()
  }, [cargarTurnos])

  async function handleCancelar(turnoId) {
    setCancelando(turnoId)
    setErrorCancel('')
    try {
      await turnoService.cancelar(turnoId, paciente.id, motivoCancelacion)
      setTurnoAConfirmar(null)
      setMotivo('')
      // Actualizar lista optimistamente y luego refrescar desde servidor
      setTurnos(prev =>
        prev.map(t => t.id === turnoId ? { ...t, estado: 'CANCELADO' } : t)
      )
      cargarTurnos()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrorCancel('No se puede cancelar con menos de 2 horas de anticipación.')
      } else if (err.response?.status === 403) {
        setErrorCancel('No estás autorizado a cancelar este turno.')
      } else {
        setErrorCancel('Error al cancelar. Intentá de nuevo.')
      }
    } finally {
      setCancelando(null)
    }
  }

  function abrirConfirmacion(turnoId) {
    setTurnoAConfirmar(turnoId)
    setMotivo('')
    setErrorCancel('')
  }

  function cerrarConfirmacion() {
    setTurnoAConfirmar(null)
    setMotivo('')
    setErrorCancel('')
  }

  // ── Sin paciente registrado ──────────────────────────────────────────────
  if (!loading && !paciente) {
    return (
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Mis Turnos
        </h1>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          color: '#64748b',
          fontSize: '0.95rem',
        }}>
          Primero registrá tus datos en la{' '}
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            página de inicio
          </a>{' '}
          para ver tus turnos.
        </div>
      </div>
    )
  }

  if (loading) {
    return <div style={{ color: '#64748b', fontSize: '0.95rem' }}>Cargando turnos...</div>
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        color: '#dc2626',
        fontSize: '0.9rem',
      }}>
        ⚠ {error}
      </div>
    )
  }

  const turnosPendientes = turnos.filter(t => CANCELABLE_STATES.has(t.estado))
  const turnosPasados    = turnos.filter(t => !CANCELABLE_STATES.has(t.estado))

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        Mis Turnos
      </h1>

      {paciente && (
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {paciente.nombre} {paciente.apellido} — CI: {paciente.ci}
        </p>
      )}

      {turnos.length === 0 ? (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          color: '#64748b',
          textAlign: 'center',
        }}>
          No tenés turnos agendados aún.
        </div>
      ) : (
        <>
          {turnosPendientes.length > 0 && (
            <Section titulo="Próximos turnos">
              {turnosPendientes.map(turno => (
                <TarjetaTurno
                  key={turno.id}
                  turno={turno}
                  onCancelar={() => abrirConfirmacion(turno.id)}
                  cancelable
                />
              ))}
            </Section>
          )}

          {turnosPasados.length > 0 && (
            <Section titulo="Historial">
              {turnosPasados.map(turno => (
                <TarjetaTurno key={turno.id} turno={turno} cancelable={false} />
              ))}
            </Section>
          )}
        </>
      )}

      {/* Modal de confirmación de cancelación */}
      {turnoAConfirmar && (
        <div
          onClick={cerrarConfirmacion}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
              ¿Cancelar turno?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              Solo podés cancelar hasta 2 horas antes del turno.
            </p>

            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={motivoCancelacion}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: no puedo asistir"
              style={{
                width: '100%', padding: '0.6rem 0.85rem',
                borderRadius: '8px', border: '1.5px solid #e2e8f0',
                fontSize: '0.875rem', boxSizing: 'border-box',
                marginBottom: '1rem', outline: 'none',
              }}
            />

            {errorCancelacion && (
              <p style={{ fontSize: '0.82rem', color: '#dc2626', marginBottom: '0.75rem' }}>
                ⚠ {errorCancelacion}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={cerrarConfirmacion}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}
              >
                Volver
              </button>
              <button
                onClick={() => handleCancelar(turnoAConfirmar)}
                disabled={cancelando === turnoAConfirmar}
                style={{
                  flex: 1, padding: '0.7rem', borderRadius: '8px',
                  border: 'none', backgroundColor: '#dc2626', color: 'white',
                  cursor: cancelando ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: '600',
                  opacity: cancelando ? 0.7 : 1,
                }}
              >
                {cancelando === turnoAConfirmar ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
        {titulo}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {children}
      </div>
    </div>
  )
}

function TarjetaTurno({ turno, onCancelar, cancelable }) {
  const colores = ESTADO_COLOR[turno.estado] ?? ESTADO_COLOR.PENDIENTE

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.2rem' }}>
          Dr/a. {turno.medico.nombre} {turno.medico.apellido}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.4rem' }}>
          {turno.medico.especialidad}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#334155' }}>
          📅 {formatearFecha(turno.fecha)} &nbsp; 🕐 {turno.hora}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: '600',
          padding: '0.3rem 0.7rem', borderRadius: '999px',
          backgroundColor: colores.bg,
          border: `1px solid ${colores.border}`,
          color: colores.text,
          whiteSpace: 'nowrap',
        }}>
          {turno.estado}
        </span>

        {cancelable && onCancelar && (
          <button
            onClick={onCancelar}
            style={{
              fontSize: '0.75rem', color: '#dc2626',
              background: 'none', border: '1px solid #fecaca',
              borderRadius: '6px', padding: '0.25rem 0.6rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return fechaStr
  }
}

export default MisTurnos