// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { pacienteService }     from '../../services/pacienteService'
import { medicoService }       from '../../services/medicoService'

export default function LoginPage() {
  const navigate = useNavigate()

  const [rol, setRol]         = useState('PACIENTE')
  const [ci, setCi]           = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const cambiarRol = (nuevoRol) => {
    setRol(nuevoRol)
    setCi(''); setMedicoId(''); setError('')
  }

  // ── Ingreso como PACIENTE ────────────────────────────────────────────────
  const handlePaciente = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await pacienteService.buscarPorCi(ci)
      const sesion = { rol: 'PACIENTE', nombre: data.nombre, ...data }
      sessionStorage.setItem('sesion',   JSON.stringify(sesion))
      sessionStorage.setItem('paciente', JSON.stringify(data))
      window.dispatchEvent(new Event('storage'))
      navigate('/buscar')
    } catch (err) {
      if (err.response?.status === 404)
        setError('CI no encontrado. ¿Todavía no te registraste?')
      else
        setError('Error al conectar con el servidor.')
    } finally { setLoading(false) }
  }

  // ── Ingreso como MÉDICO ──────────────────────────────────────────────────
  const handleMedico = async (e) => {
    e.preventDefault()
    if (!medicoId.trim()) { setError('Ingresá tu ID de médico.'); return }
    setLoading(true); setError('')
    try {
      const data = await medicoService.getById(Number(medicoId))
      const sesion = { rol: 'MEDICO', nombre: `${data.nombre} ${data.apellido}`, id: data.id, ...data }
      sessionStorage.setItem('sesion', JSON.stringify(sesion))
      window.dispatchEvent(new Event('storage'))
      navigate('/medico')
    } catch (err) {
      if (err.response?.status === 404) setError('Médico no encontrado. Verificá tu ID.')
      else setError('Error al conectar con el servidor.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%,    rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 60%  20%,  rgba(220,234,243,0.4) 0%, transparent 40%)
      `,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.25rem', fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      overflowY: 'auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .li-input:focus { border-color:rgba(122,176,200,0.9)!important; box-shadow:0 4px 24px rgba(74,124,158,0.18)!important; }
      `}</style>

      {/* Decoración */}
      <div style={{ position:'absolute', top:'10%', left:'8%', width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,0.18)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'12%', right:'6%', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.12)', pointerEvents:'none' }} />

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:480,
        background:'rgba(255,255,255,0.72)', backdropFilter:'blur(20px)',
        borderRadius:28, border:'1.5px solid rgba(255,255,255,0.9)',
        boxShadow:'0 16px 60px rgba(74,124,158,0.18)',
        padding:'clamp(1.75rem,5vw,2.75rem)',
        animation:'fadeUp 0.5s ease both', position:'relative', zIndex:1,
      }}>

        {/* Header */}
        <p style={{ fontSize:'0.7rem', fontWeight:500, color:'#4a7c9e', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'0.6rem' }}>
          Portal de salud — Turnos online
        </p>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1.8rem,4vw,2.4rem)', fontWeight:400, color:'#1c3545', lineHeight:1.15, letterSpacing:'-0.02em', margin:'0 0 0.6rem' }}>
          Bienvenido/a a<br />
          <em style={{ fontStyle:'italic', color:'#4a7c9e' }}>MediTurnos.</em>
        </h1>
        <p style={{ fontSize:'0.88rem', color:'#7fa3b8', lineHeight:1.6, fontWeight:300, margin:'0 0 1.5rem' }}>
          Seleccioná cómo querés ingresar al sistema.
        </p>

        {/* Selector de rol */}
        <div style={{ display:'flex', background:'rgba(74,124,158,0.08)', borderRadius:50, padding:4, marginBottom:'1.75rem', gap:4 }}>
          {[
            { key:'PACIENTE', label:'Soy paciente' },
            { key:'MEDICO',   label:'Soy médico'   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => cambiarRol(key)}
              style={{
                flex:1, padding:'0.55rem 1rem', borderRadius:50, border:'none',
                background: rol === key ? '#4a7c9e' : 'transparent',
                color:      rol === key ? '#fff'    : '#4a7c9e',
                fontFamily: "'DM Sans',sans-serif",
                fontSize:'0.83rem', fontWeight: rol === key ? 600 : 400,
                cursor:'pointer', transition:'all 0.2s',
                boxShadow: rol === key ? '0 4px 14px rgba(74,124,158,0.25)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ height:1, background:'rgba(74,124,158,0.1)', marginBottom:'1.75rem' }} />

        {/* ── Form paciente ── */}
        {rol === 'PACIENTE' && (
          <>
            <form onSubmit={handlePaciente} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={labelStyle}>Carnet de Identidad</label>
                <div style={{ position:'relative' }}>
                  <IdIcon focused={focused} />
                  <input
                    type="text" className="li-input" value={ci}
                    onChange={e => setCi(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder="Ej: 12345678" required
                    style={inputStyle}
                  />
                </div>
              </div>
              <MensajeError texto={error} />
              <BtnSubmit loading={loading} label="Continuar →" />
            </form>

            {/* Link a registro — va al formulario de inicio */}
            <div style={{ textAlign:'center', marginTop:'1.25rem' }}>
              <span style={{ fontSize:'0.82rem', color:'#7fa3b8' }}>¿Primera vez? </span>
              <button
                onClick={() => navigate('/')}
                style={{
                  background:'none', border:'none', padding:0, cursor:'pointer',
                  fontSize:'0.82rem', color:'#4a7c9e', fontWeight:500,
                  fontFamily:"'DM Sans',sans-serif", textDecoration:'underline',
                  textUnderlineOffset:3,
                }}
              >
                Registrate aquí
              </button>
            </div>
          </>
        )}

        {/* ── Form médico ── */}
        {rol === 'MEDICO' && (
          <form onSubmit={handleMedico} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={labelStyle}>ID de médico</label>
              <div style={{ position:'relative' }}>
                <MedicoIcon focused={focused} />
                <input
                  type="number" className="li-input" value={medicoId}
                  onChange={e => setMedicoId(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="Ej: 1" required min="1"
                  style={inputStyle}
                />
              </div>
              <p style={{ fontSize:'0.74rem', color:'#b0c8d4', marginTop:'0.4rem' }}>
                Ingresá el ID numérico asignado por tu institución.
              </p>
            </div>
            <MensajeError texto={error} />
            <BtnSubmit loading={loading} label="Ingresar como médico →" />
          </form>
        )}

        <p style={{ fontSize:'0.72rem', color:'#b0c8d4', textAlign:'center', marginTop:'1.5rem', lineHeight:1.5 }}>
          Sistema de gestión de turnos médicos
        </p>
      </div>
    </div>
  )
}

// ── Estilos y sub-componentes ─────────────────────────────────────────────────

const labelStyle = {
  display:'block', fontSize:'0.75rem', fontWeight:500,
  color:'#4a7c9e', letterSpacing:'0.08em', textTransform:'uppercase',
  marginBottom:'0.5rem',
}

const inputStyle = {
  width:'100%', padding:'0.9rem 1rem 0.9rem 2.8rem',
  borderRadius:14, border:'1.5px solid rgba(255,255,255,0.8)',
  background:'rgba(255,255,255,0.92)', fontSize:'0.95rem',
  color:'#1c3545', fontFamily:"'DM Sans',sans-serif",
  outline:'none', transition:'all 0.25s', boxSizing:'border-box',
}

function MensajeError({ texto }) {
  if (!texto) return null
  return (
    <p style={{
      fontSize:'0.82rem', color:'#dc2626', margin:0,
      padding:'0.6rem 0.9rem', background:'rgba(239,68,68,0.06)',
      borderRadius:10, border:'1px solid rgba(239,68,68,0.15)',
    }}>⚠ {texto}</p>
  )
}

function BtnSubmit({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:'100%', padding:'0.9rem', borderRadius:50, border:'none',
      background: loading ? 'rgba(74,124,158,0.5)' : 'linear-gradient(135deg,#4a7c9e,#3a6282)',
      color:'white', fontSize:'0.9rem', fontWeight:500,
      cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.04em',
      transition:'all 0.22s', marginTop:'0.25rem',
    }}>
      {loading ? 'Verificando...' : label}
    </button>
  )
}

function IdIcon({ focused }) {
  return (
    <svg style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color: focused ? '#4a7c9e' : '#a8c4d4', transition:'color 0.2s', pointerEvents:'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8"/>
      <circle cx="9" cy="11" r="2" strokeWidth="1.8"/>
      <path d="M13 9h4M13 13h4M7 17h10" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MedicoIcon({ focused }) {
  return (
    <svg style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', width:16, height:16, color: focused ? '#4a7c9e' : '#a8c4d4', transition:'color 0.2s', pointerEvents:'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" strokeWidth="1.8"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 13v4M15 15h4" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}