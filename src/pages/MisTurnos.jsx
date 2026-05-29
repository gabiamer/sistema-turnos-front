// src/pages/MisTurnos.jsx
import { useState, useEffect, useCallback } from 'react'
import { turnoService } from '../services/turnoService'

const fontLink = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

const ESTADO_COLOR = {
  CONFIRMADO: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  PENDIENTE:  { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  CANCELADO:  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  BLOQUEADO:  { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b' },
  EXPIRADO:   { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8' },
}

const CANCELABLE_STATES = new Set(['CONFIRMADO', 'PENDIENTE', 'BLOQUEADO'])

function MisTurnos() {
  // Inicialización sincrónica desde sessionStorage para evitar flash de contenido vacío
  const [paciente] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('paciente') ?? 'null') }
    catch { return null }
  })

  const [turnos, setTurnos]   = useState([])
  const [loading, setLoading] = useState(!!paciente)
  const [error, setError]     = useState('')

  const [cancelando, setCancelando]           = useState(null)
  const [motivoCancelacion, setMotivo]        = useState('')
  const [errorCancelacion, setErrorCancel]    = useState('')
  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null)

  const cargarTurnos = useCallback(() => {
    if (!paciente?.id) { setLoading(false); return }
    setLoading(true)
    turnoService.listar(paciente.id)
      .then(data => setTurnos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los turnos. Intentá más tarde.'))
      .finally(() => setLoading(false))
  }, [paciente])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  async function handleCancelar(turnoId) {
    setCancelando(turnoId)
    setErrorCancel('')
    try {
      await turnoService.cancelar(turnoId, paciente.id, motivoCancelacion)
      setTurnoAConfirmar(null)
      setMotivo('')
      // Actualización optimista + refresh desde servidor
      setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, estado: 'CANCELADO' } : t))
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

  const turnosPendientes = turnos.filter(t => CANCELABLE_STATES.has(t.estado))
  const turnosPasados    = turnos.filter(t => !CANCELABLE_STATES.has(t.estado))

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%, rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 60% 20%, rgba(220,234,243,0.4) 0%, transparent 40%)
      `,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        ${fontLink}
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      <div style={{
        padding: 'clamp(2.5rem,5vw,4rem) clamp(2rem,5vw,4rem) clamp(1.5rem,3vw,3rem)',
        maxWidth: '1400px',
        margin: '0 auto',
        animation: 'fadeUp 0.5s ease both',
      }}>
        <p style={{ fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Portal de salud — Mis turnos
        </p>

        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
          fontWeight: '400',
          color: '#1c3545',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 clamp(2rem,4vw,3.5rem)',
        }}>
          Mis <em style={{ fontStyle: 'italic', color: '#4a7c9e' }}>turnos</em>
        </h1>

        {/* Sin paciente registrado */}
        {!paciente && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2rem', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 40px rgba(74,124,158,0.12)', color: '#4a7c9e', fontSize: '0.95rem', animation: 'fadeUp 0.5s ease 0.1s both', maxWidth: '480px' }}>
            Primero registrá tus datos en la{' '}
            <a href="/login" style={{ color: '#4a7c9e', fontWeight: '600', textDecoration: 'underline' }}>
              página de inicio
            </a>{' '}
            para ver tus turnos.
          </div>
        )}

        {/* Spinner de carga */}
        {paciente && loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7fa3b8', animation: 'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(74,124,158,0.2)', borderTopColor: '#4a7c9e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Cargando turnos...</p>
          </div>
        )}

        {/* Error de red */}
        {paciente && !loading && error && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.5rem 2rem', border: '1.5px solid rgba(220,38,38,0.25)', color: '#dc2626', fontSize: '0.9rem', animation: 'fadeUp 0.5s ease 0.1s both' }}>
            ⚠ {error}
          </div>
        )}

        {/* Contenido principal */}
        {paciente && !loading && !error && (
          <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
            <p style={{ color: '#4a7c9e', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: '300' }}>
              {paciente.nombre} {paciente.apellido} · CI: {paciente.ci}
            </p>

            {turnos.length === 0 ? (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2.5rem', border: '1.5px solid rgba(255,255,255,0.85)', textAlign: 'center', color: '#7fa3b8', fontSize: '0.95rem', boxShadow: '0 8px 40px rgba(74,124,158,0.12)' }}>
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
          </div>
        )}
      </div>

      {/* Modal de confirmación de cancelación */}
      {turnoAConfirmar && (
        <div
          onClick={cerrarConfirmacion}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,53,69,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'rgba(240,248,252,0.98)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(28,53,69,0.22)', border: '1.5px solid rgba(255,255,255,0.85)', animation: 'modalIn 0.25s ease', fontFamily: "'DM Sans', sans-serif" }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
                  Cancelación de turno
                </p>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.25rem', fontWeight: '400', color: '#1c3545', margin: 0 }}>
                  ¿Cancelar turno?
                </h3>
              </div>
              <button
                onClick={cerrarConfirmacion}
                aria-label="Cerrar modal de cancelación"
                style={{ background: 'rgba(74,124,158,0.1)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', color: '#4a7c9e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#7fa3b8', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Solo podés cancelar hasta 2 horas antes del turno.
            </p>

            <label style={{ fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={motivoCancelacion}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: no puedo asistir"
              aria-label="Motivo de cancelación"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid rgba(74,124,158,0.25)', backgroundColor: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', color: '#1c3545', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}
            />

            {errorCancelacion && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.18)', color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                ⚠ {errorCancelacion}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={cerrarConfirmacion}
                aria-label="Volver sin cancelar"
                style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '50px', border: '1.5px solid rgba(74,124,158,0.3)', background: 'rgba(255,255,255,0.7)', color: '#4a7c9e', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}
              >
                Volver
              </button>
              <button
                onClick={() => handleCancelar(turnoAConfirmar)}
                disabled={cancelando === turnoAConfirmar}
                aria-label="Confirmar cancelación del turno"
                style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', fontSize: '0.85rem', fontWeight: '500', cursor: cancelando ? 'not-allowed' : 'pointer', opacity: cancelando ? 0.7 : 1, letterSpacing: '0.04em', transition: 'all 0.2s' }}
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
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

function TarjetaTurno({ turno, onCancelar, cancelable }) {
  const colores = ESTADO_COLOR[turno.estado] ?? ESTADO_COLOR.PENDIENTE

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '1.5rem 2rem',
      border: '1.5px solid rgba(255,255,255,0.85)',
      boxShadow: '0 8px 40px rgba(74,124,158,0.12)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <div>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.05rem', fontWeight: '400', color: '#1c3545', marginBottom: '0.25rem' }}>
          Dr/a. {turno.medico.nombre} {turno.medico.apellido}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#4a7c9e', marginBottom: '0.5rem', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {turno.medico.especialidad}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#2c4a5a' }}>
          📅 {formatearFecha(turno.fecha)} &nbsp;·&nbsp; 🕐 {turno.hora}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: '600',
          padding: '0.3rem 0.9rem', borderRadius: '999px',
          backgroundColor: colores.bg,
          border: `1px solid ${colores.border}`,
          color: colores.text,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {turno.estado}
        </span>

        {cancelable && onCancelar && (
          <button
            onClick={onCancelar}
            aria-label={`Cancelar turno con Dr/a. ${turno.medico.nombre} ${turno.medico.apellido}`}
            style={{
              fontSize: '0.78rem', color: '#dc2626',
              background: 'rgba(220,38,38,0.06)',
              border: '1.5px solid rgba(220,38,38,0.2)',
              borderRadius: '50px', padding: '0.35rem 0.9rem',
              cursor: 'pointer', fontWeight: '500',
              transition: 'all 0.18s', whiteSpace: 'nowrap',
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
