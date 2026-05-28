import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { turnoService } from '../services/turnoService'
import { pacienteService } from '../services/pacienteService'

const DURACION_BLOQUEO = 5 * 60
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

function ModalTurno({ slot, medico, onCerrar }) {
  const navigate = useNavigate()
  const [fase, setFase]                    = useState('identificacion')
  const [segundosRestantes, setSegundos]   = useState(DURACION_BLOQUEO)
  const [turnoId, setTurnoId]              = useState(null)
  const [mensajeError, setMensajeError]    = useState('')
  const [loadingConfirmar, setLoadingConf] = useState(false)
  const intervaloRef = useRef(null)

  const [ci, setCi]               = useState('')
  const [loadingCi, setLoadingCi] = useState(false)
  const [errorCi, setErrorCi]     = useState('')
  const [paciente, setPaciente]   = useState(null)

  useEffect(() => {
    if (fase !== 'bloqueando') return
    intervaloRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) { clearInterval(intervaloRef.current); setFase('expirado'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervaloRef.current)
  }, [fase])

  useEffect(() => () => clearInterval(intervaloRef.current), [])

  async function handleBuscarPaciente() {
    if (!ci.trim()) { setErrorCi('Ingresá tu CI para continuar.'); return }
    setLoadingCi(true); setErrorCi('')
    try {
      const data = await pacienteService.buscarPorCi(ci.trim())
      setPaciente(data)
      setFase('resumen')
    } catch (err) {
      if (err.response?.status === 404) setErrorCi('No encontramos ese CI. Verificá o registrate primero.')
      else setErrorCi('Error al buscar el paciente. Intentá de nuevo.')
    } finally { setLoadingCi(false) }
  }

  async function handleSolicitar() {
    setFase('bloqueando'); setMensajeError('')
    try {
      const data = await turnoService.solicitar(paciente.id, medico.id, slot.fecha, slot.hora)
      setTurnoId(data.turnoId)
    } catch (err) {
      clearInterval(intervaloRef.current)
      if (err.response?.status === 409)      setMensajeError('Este turno ya fue tomado por otro paciente.')
      else if (err.response?.status === 422) setMensajeError('Ya tenés un turno reservado para ese día.')
      else                                   setMensajeError('No se pudo reservar el turno. Intentá de nuevo.')
      setFase('error')
    }
  }

  async function handleConfirmar() {
    if (!turnoId) return
    setLoadingConf(true); clearInterval(intervaloRef.current)
    try {
      await turnoService.confirmar(turnoId)
      navigate('/paciente/turnos')
    } catch (err) {
      if (err.response?.status === 410)      setFase('expirado')
      else if (err.response?.status === 409) { setMensajeError('Este turno ya fue tomado.'); setFase('error') }
      else                                   { setMensajeError('Error al confirmar. Intentá de nuevo.'); setFase('error') }
    } finally { setLoadingConf(false) }
  }

  const minutos    = String(Math.floor(segundosRestantes / 60)).padStart(2, '0')
  const segundos   = String(segundosRestantes % 60).padStart(2, '0')
  const porcentaje = (segundosRestantes / DURACION_BLOQUEO) * 100
  const colorBarra = porcentaje > 50 ? '#4a7c9e' : porcentaje > 20 ? '#c9a96e' : '#dc2626'

  return (
    <div onClick={onCerrar} style={{ position:'fixed', inset:0, backgroundColor:'rgba(28,53,69,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'1rem' }}>
      <style>{`
        ${fontImport}
        @keyframes modalSlideIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{ backgroundColor:'rgba(240,248,252,0.97)', backdropFilter:'blur(20px)', borderRadius:'24px', padding:'2rem', width:'100%', maxWidth:'420px', boxShadow:'0 32px 80px rgba(28,53,69,0.2)', border:'1.5px solid rgba(255,255,255,0.85)', animation:'modalSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <p style={{ fontSize:'0.7rem', fontWeight:'500', color:'#4a7c9e', letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 0.3rem' }}>Reserva de turno</p>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.25rem', fontWeight:'400', color:'#1c3545', margin:0 }}>
              {fase === 'identificacion' ? 'Identificate' : 'Confirmá tu cita'}
            </h2>
          </div>
          <button onClick={onCerrar} style={{ background:'rgba(74,124,158,0.1)', border:'none', borderRadius:'10px', width:'32px', height:'32px', cursor:'pointer', color:'#4a7c9e', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Resumen del turno (todas las fases menos identificacion) */}
        {fase !== 'identificacion' && (
          <div style={{ backgroundColor:'rgba(74,124,158,0.06)', border:'1.5px solid rgba(74,124,158,0.15)', borderRadius:'16px', padding:'1.25rem', marginBottom:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' }}>
            <InfoItem label="Médico"       value={`Dr. ${medico.nombre} ${medico.apellido}`} full />
            <InfoItem label="Especialidad" value={medico.especialidad} />
            <InfoItem label="Fecha"        value={formatearFecha(slot.fecha)} />
            <InfoItem label="Hora"         value={slot.hora} />
            {paciente && <InfoItem label="Paciente" value={`${paciente.nombre} ${paciente.apellido}`} full />}
          </div>
        )}

        {/* ── FASE: identificacion ── */}
        {fase === 'identificacion' && (
          <>
            <div style={{ backgroundColor:'rgba(74,124,158,0.06)', border:'1.5px solid rgba(74,124,158,0.15)', borderRadius:'16px', padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
              <InfoItem label="Médico" value={`Dr. ${medico.nombre} ${medico.apellido}`} />
              <div style={{ marginTop:'0.6rem' }}>
                <InfoItem label="Fecha" value={`${formatearFecha(slot.fecha)} — ${slot.hora}`} />
              </div>
            </div>

            <p style={{ fontSize:'0.82rem', color:'#7fa3b8', marginBottom:'1rem', lineHeight:1.6 }}>
              Ingresá tu CI para identificarte y continuar con la reserva.
            </p>

            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:'500', color:'#4a7c9e', letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Cédula de identidad</label>
              <input
                type="text"
                value={ci}
                onChange={e => { setCi(e.target.value); setErrorCi('') }}
                onKeyDown={e => e.key === 'Enter' && handleBuscarPaciente()}
                placeholder="Ej: 12345678"
                style={{ width:'100%', padding:'0.75rem 1rem', borderRadius:'12px', border: errorCi ? '1.5px solid #dc2626' : '1.5px solid rgba(74,124,158,0.25)', backgroundColor:'rgba(255,255,255,0.8)', fontSize:'0.9rem', color:'#1c3545', outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" }}
              />
              {errorCi && <p style={{ fontSize:'0.75rem', color:'#dc2626', margin:'0.4rem 0 0' }}>{errorCi}</p>}
            </div>

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={onCerrar} style={btnOutline}>Cancelar</button>
              <button onClick={handleBuscarPaciente} disabled={loadingCi} style={{ ...btnFill, opacity: loadingCi ? 0.7 : 1, cursor: loadingCi ? 'not-allowed' : 'pointer' }}>
                {loadingCi ? 'Buscando...' : 'Continuar'}
              </button>
            </div>
          </>
        )}

        {/* ── FASE: resumen ── */}
        {fase === 'resumen' && (
          <>
            <p style={{ fontSize:'0.82rem', color:'#7fa3b8', marginBottom:'1.25rem', lineHeight:1.6 }}>
              Al confirmar, se reservará el turno por <strong style={{ color:'#4a7c9e' }}>5 minutos</strong> mientras completás la reserva.
            </p>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={onCerrar} style={btnOutline}>Cancelar</button>
              <button onClick={handleSolicitar} style={btnFill}>Reservar</button>
            </div>
          </>
        )}

        {/* ── FASE: bloqueando ── */}
        {fase === 'bloqueando' && (
          <>
            <p style={{ fontSize:'0.82rem', color:'#7fa3b8', marginBottom:'1rem', lineHeight:1.6 }}>Turno reservado temporalmente. Confirmalo antes de que expire.</p>
            <div style={{ backgroundColor:'rgba(74,124,158,0.1)', borderRadius:'99px', height:'6px', marginBottom:'0.75rem', overflow:'hidden' }}>
              <div style={{ width:`${porcentaje}%`, height:'100%', borderRadius:'99px', backgroundColor:colorBarra, transition:'width 1s linear, background-color 0.5s' }} />
            </div>
            <p style={{ textAlign:'center', fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2.5rem', fontWeight:'400', color:colorBarra, marginBottom:'1.25rem', letterSpacing:'0.04em', animation: porcentaje < 20 ? 'timerPulse 1s infinite' : 'none' }}>
              {minutos}:{segundos}
            </p>
            <button onClick={handleConfirmar} disabled={loadingConfirmar} style={{ ...btnFill, width:'100%', opacity: loadingConfirmar ? 0.7 : 1, cursor: loadingConfirmar ? 'not-allowed' : 'pointer' }}>
              {loadingConfirmar ? 'Confirmando...' : 'Confirmar turno'}
            </button>
          </>
        )}

        {/* ── FASE: expirado ── */}
        {fase === 'expirado' && (
          <>
            <div style={alertaBox('#c9a96e','rgba(201,169,110,0.08)','rgba(201,169,110,0.2)')}>⏱ Bloqueo expirado. El turno volvió a estar disponible.</div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
              <button onClick={onCerrar} style={btnOutline}>Cerrar</button>
              <button onClick={() => { setFase('resumen'); setSegundos(DURACION_BLOQUEO) }} style={btnFill}>Intentar de nuevo</button>
            </div>
          </>
        )}

        {/* ── FASE: error ── */}
        {fase === 'error' && (
          <>
            <div style={alertaBox('#dc2626','rgba(220,38,38,0.06)','rgba(220,38,38,0.18)')}>{mensajeError}</div>
            <button onClick={onCerrar} style={{ ...btnOutline, width:'100%', marginTop:'1rem' }}>Cerrar</button>
          </>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? '1/-1' : undefined }}>
      <p style={{ fontSize:'0.68rem', color:'#7fa3b8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 0.2rem', fontWeight:'500' }}>{label}</p>
      <p style={{ fontSize:'0.88rem', color:'#1c3545', margin:0, fontWeight:'500' }}>{value}</p>
    </div>
  )
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

function alertaBox(color, bg, border) {
  return { padding:'1rem', borderRadius:'14px', backgroundColor:bg, border:`1.5px solid ${border}`, color, fontSize:'0.82rem', lineHeight:1.5 }
}

const btnFill = { flex:1, padding:'0.8rem 1.25rem', borderRadius:'50px', border:'none', background:'linear-gradient(135deg, #4a7c9e, #3a6282)', color:'white', fontSize:'0.85rem', fontWeight:'500', cursor:'pointer', letterSpacing:'0.04em', transition:'all 0.2s' }
const btnOutline = { flex:1, padding:'0.8rem 1.25rem', borderRadius:'50px', border:'1.5px solid rgba(74,124,158,0.3)', background:'rgba(255,255,255,0.7)', color:'#4a7c9e', fontSize:'0.85rem', fontWeight:'500', cursor:'pointer' }

export default ModalTurno