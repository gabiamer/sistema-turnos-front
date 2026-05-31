// src/pages/agenda/GestionAgendaPage.jsx
// Rediseño con design system editorial pastel — consistente con el resto del proyecto.
// Lee medicoId de sessionStorage['sesion'].

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { agendaService }       from '../../services/agendaService'
import { medicoService }       from '../../services/medicoService'

const DIAS = [
  { label: 'Lunes',     value: 1 },
  { label: 'Martes',    value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves',    value: 4 },
  { label: 'Viernes',   value: 5 },
  { label: 'Sábado',    value: 6 },
  { label: 'Domingo',   value: 7 },
]

const DURACIONES = [15, 20, 30, 45, 60]

function getMedicoIdSesion() {
  try {
    const raw = sessionStorage.getItem('sesion')
    if (!raw) return null
    const s = JSON.parse(raw)
    return s?.rol === 'MEDICO' ? s.id : null
  } catch { return null }
}

export default function GestionAgendaPage() {
  const navigate   = useNavigate()
  const medicoId   = getMedicoIdSesion()

  const [medico, setMedico]                       = useState(null)
  const [diasSeleccionados, setDiasSeleccionados] = useState({})
  const [duracion, setDuracion]                   = useState(30)
  const [loading, setLoading]                     = useState(false)
  const [mensaje, setMensaje]                     = useState(null)
  const [error, setError]                         = useState(null)

  // Bloqueos
  const [fechaInicio, setFechaInicio]           = useState('')
  const [fechaFin, setFechaFin]                 = useState('')
  const [motivo, setMotivo]                     = useState('')
  const [loadingBloqueo, setLoadingBloqueo]     = useState(false)
  const [mensajeBloqueo, setMensajeBloqueo]     = useState(null)

  useEffect(() => {
    if (!medicoId) { navigate('/login', { replace: true }); return }
    medicoService.getById(medicoId).then(setMedico).catch(console.error)
    agendaService.getByMedico(medicoId).then(agenda => {
      const initial = {}
      agenda.filter(a => a.activo).forEach(a => {
        initial[a.diaSemana] = { horaInicio: a.horaInicio, horaFin: a.horaFin }
      })
      setDiasSeleccionados(initial)
    }).catch(console.error)
  }, [medicoId, navigate])

  const toggleDia = (v) => setDiasSeleccionados(prev => {
    const c = { ...prev }
    if (c[v]) delete c[v]; else c[v] = { horaInicio:'08:00', horaFin:'17:00' }
    return c
  })

  const updateHora = (v, campo, val) => setDiasSeleccionados(prev => ({
    ...prev, [v]: { ...prev[v], [campo]: val }
  }))

  const guardarAgenda = async () => {
    setLoading(true); setMensaje(null); setError(null)
    const dias = Object.entries(diasSeleccionados).map(([dia, h]) => ({
      diaSemana: Number(dia), horaInicio: h.horaInicio, horaFin: h.horaFin,
      duracionMinutos: duracion,
    }))
    try {
      await agendaService.actualizarAgenda(medicoId, dias)
      setMensaje('Agenda guardada correctamente')
    } catch (err) {
      setError(err.response?.status === 409
        ? 'Hay turnos confirmados en el horario que querés modificar. Reasignalos antes.'
        : 'Error al guardar la agenda. Intentá de nuevo.')
    } finally { setLoading(false) }
  }

  const guardarBloqueo = async () => {
    if (!fechaInicio || !fechaFin) {
      setMensajeBloqueo({ tipo:'error', texto:'Seleccioná un rango de fechas.' }); return
    }
    setLoadingBloqueo(true); setMensajeBloqueo(null)
    try {
      await agendaService.crearBloqueo(medicoId, { fechaInicio, fechaFin, motivo })
      setMensajeBloqueo({ tipo:'ok', texto:'Bloqueo registrado correctamente.' })
      setFechaInicio(''); setFechaFin(''); setMotivo('')
    } catch (err) {
      setMensajeBloqueo({ tipo:'error', texto: err.response?.status === 409
        ? 'Hay turnos confirmados en ese período.'
        : 'Error al guardar el bloqueo.' })
    } finally { setLoadingBloqueo(false) }
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: 'var(--color-fondo)',
      backgroundImage: 'var(--color-fondo-gradiente)',
      fontFamily: 'var(--font-body)',
      padding:    'clamp(2rem,4vw,3rem) clamp(1rem,4vw,2rem)',
    }}>

      {/* ── Header ── */}
      <div style={{ maxWidth:720, margin:'0 auto 2rem' }}>
        <button
          onClick={() => navigate('/medico')}
          style={{
            background:'none', border:'none', cursor:'pointer',
            fontSize:13, color:'var(--color-texto-suave)',
            fontFamily:'var(--font-body)', display:'flex',
            alignItems:'center', gap:6, padding:0, marginBottom:16,
          }}
        >
          ← Volver a mi agenda
        </button>
        <p className="eyebrow" style={{ marginBottom:6 }}>Configuración</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize:'clamp(1.6rem,3.5vw,2.2rem)',
          fontWeight:400, color:'var(--color-texto)',
          margin:'0 0 0.35rem', letterSpacing:'-0.02em',
        }}>
          Gestión de Agenda
        </h1>
        {medico && (
          <p style={{ fontSize:14, color:'var(--color-texto-suave)', margin:0 }}>
            Dr. {medico.nombre} {medico.apellido} · {medico.especialidad}
          </p>
        )}
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── Bloque: días de atención ── */}
        <SeccionCard titulo="Días y horarios de atención" eyebrow="Agenda semanal">
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {DIAS.map(dia => (
              <div key={dia.value} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 14px',
                background: diasSeleccionados[dia.value] ? 'rgba(74,124,158,0.07)' : 'transparent',
                borderRadius:'var(--radio-md)',
                border: `1.5px solid ${diasSeleccionados[dia.value] ? 'rgba(74,124,158,0.2)' : 'rgba(74,124,158,0.08)'}`,
                transition:'all 0.18s',
              }}>
                {/* Checkbox custom */}
                <button
                  onClick={() => toggleDia(dia.value)}
                  style={{
                    width:22, height:22, borderRadius:7, flexShrink:0,
                    border:'1.5px solid',
                    borderColor: diasSeleccionados[dia.value] ? '#4a7c9e' : 'rgba(74,124,158,0.3)',
                    background:  diasSeleccionados[dia.value] ? '#4a7c9e' : 'transparent',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.15s',
                  }}
                >
                  {diasSeleccionados[dia.value] && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <span style={{
                  width:90, fontSize:14, fontWeight:500,
                  color: diasSeleccionados[dia.value] ? 'var(--color-texto)' : 'var(--color-texto-muted)',
                  transition:'color 0.15s',
                }}>
                  {dia.label}
                </span>

                {diasSeleccionados[dia.value] && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <input
                      type="time"
                      value={diasSeleccionados[dia.value].horaInicio}
                      onChange={e => updateHora(dia.value, 'horaInicio', e.target.value)}
                      style={timeInputStyle}
                    />
                    <span style={{ color:'var(--color-texto-muted)', fontSize:13 }}>–</span>
                    <input
                      type="time"
                      value={diasSeleccionados[dia.value].horaFin}
                      onChange={e => updateHora(dia.value, 'horaFin', e.target.value)}
                      style={timeInputStyle}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Duración */}
          <div style={{ marginTop:16 }}>
            <p style={{ fontSize:12, color:'var(--color-texto-suave)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
              Duración del turno
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {DURACIONES.map(d => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  style={{
                    padding:'0.45rem 1rem', borderRadius:'var(--radio-pill)',
                    border:'1.5px solid',
                    borderColor: duracion === d ? '#4a7c9e' : 'rgba(74,124,158,0.2)',
                    background:  duracion === d ? '#4a7c9e' : 'transparent',
                    color:       duracion === d ? '#fff'    : 'var(--color-texto-suave)',
                    fontSize:13, fontFamily:'var(--font-body)',
                    fontWeight: duracion === d ? 600 : 400,
                    cursor:'pointer', transition:'all 0.15s',
                  }}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {mensaje && <Alerta tipo="ok"    texto={`✓ ${mensaje}`} />}
          {error   && <Alerta tipo="error" texto={`⚠ ${error}`}  />}

          <button
            className="btn btn--primario"
            onClick={guardarAgenda}
            disabled={loading}
            style={{ marginTop:16, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Guardando...' : 'Guardar agenda'}
          </button>
        </SeccionCard>

        {/* ── Bloque: bloquear días ── */}
        <SeccionCard titulo="Bloquear días" eyebrow="Ausencias">
          <p style={{ fontSize:13, color:'var(--color-texto-muted)', marginBottom:16 }}>
            Bloqueá un rango de fechas por vacaciones, congreso u otro motivo. Los turnos confirmados en ese período mostrarán advertencia.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Campo label="Fecha inicio">
                <input
                  type="date" value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="input-base"
                />
              </Campo>
              <Campo label="Fecha fin">
                <input
                  type="date" value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="input-base"
                />
              </Campo>
            </div>
            <Campo label="Motivo (opcional)">
              <input
                type="text" value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ej: vacaciones, congreso..."
                className="input-base"
              />
            </Campo>
          </div>

          {mensajeBloqueo && (
            <Alerta tipo={mensajeBloqueo.tipo} texto={
              mensajeBloqueo.tipo === 'ok' ? `✓ ${mensajeBloqueo.texto}` : `⚠ ${mensajeBloqueo.texto}`
            } />
          )}

          <button
            className="btn btn--outline"
            onClick={guardarBloqueo}
            disabled={loadingBloqueo}
            style={{ marginTop:14, opacity: loadingBloqueo ? 0.6 : 1, cursor: loadingBloqueo ? 'not-allowed' : 'pointer' }}
          >
            {loadingBloqueo ? 'Registrando...' : 'Registrar bloqueo'}
          </button>
        </SeccionCard>

      </div>
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SeccionCard({ titulo, eyebrow, children }) {
  return (
    <div style={{
      background:     'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px)',
      borderRadius:   'var(--radio-xl)',
      border:         '1.5px solid rgba(255,255,255,0.9)',
      boxShadow:      'var(--sombra-suave)',
      padding:        '1.75rem',
    }}>
      <p className="eyebrow" style={{ marginBottom:6 }}>{eyebrow}</p>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize:18, fontWeight:400,
        color:'var(--color-texto)',
        margin:'0 0 1.25rem', letterSpacing:'-0.01em',
      }}>
        {titulo}
      </h2>
      <div style={{ height:1, background:'var(--color-borde-suave)', marginBottom:20 }} />
      {children}
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{
        fontSize:'0.72rem', fontWeight:500, color:'var(--color-texto-suave)',
        letterSpacing:'0.08em', textTransform:'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Alerta({ tipo, texto }) {
  const isOk = tipo === 'ok'
  return (
    <div style={{
      marginTop:12, padding:'0.65rem 1rem',
      background: isOk ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.06)',
      border:     `1px solid ${isOk ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: 'var(--radio-md)',
      color:      isOk ? '#16a34a' : '#dc2626',
      fontSize:13,
    }}>
      {texto}
    </div>
  )
}

const timeInputStyle = {
  padding:      '0.5rem 0.75rem',
  borderRadius: 'var(--radio-sm)',
  border:       '1.5px solid rgba(74,124,158,0.25)',
  background:   'rgba(255,255,255,0.85)',
  fontSize:     13,
  color:        'var(--color-texto)',
  fontFamily:   'var(--font-mono)',
  outline:      'none',
}