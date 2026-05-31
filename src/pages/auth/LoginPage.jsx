// src/pages/auth/LoginPage.jsx
// Un solo login con 3 tabs: Paciente · Médico · Personal (secretaría/admin)
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { pacienteService }     from '../../services/pacienteService'
import { medicoService }       from '../../services/medicoService'
import { personalStore }       from '../../store/personalStore'
import CampoInput              from '../../components/formulario/CampoInput'

const USUARIOS_DEMO = [
  { email: 'maria.lopez@clinica.com', password: 'secretaria123', rol: 'SECRETARIA',     nombre: 'María López'      },
  { email: 'carlos.ruiz@clinica.com', password: 'secretaria123', rol: 'SECRETARIA',     nombre: 'Carlos Ruiz'      },
  { email: 'admin@clinica.com',       password: 'admin123',      rol: 'ADMINISTRATIVO', nombre: 'Director Clínica' },
  { email: 'medico@clinica.com',      password: 'medico123',     rol: 'MEDICO',         nombre: 'Dr. Médico', medicoId: 1 },
]

const TABS = [
  { key: 'PACIENTE',  label: 'Paciente'  },
  { key: 'MEDICO',    label: 'Médico'    },
  { key: 'PERSONAL',  label: 'Personal'  },
]

export default function LoginPage() {
  const navigate = useNavigate()

  const [tab, setTab]           = useState('PACIENTE')
  const [ci, setCi]             = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const cambiarTab = (t) => { setTab(t); setError('') }

  // ── Paciente ──────────────────────────────────────────────────────────────
  const handlePaciente = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data   = await pacienteService.buscarPorCi(ci)
      const sesion = { rol: 'PACIENTE', nombre: data.nombre, ...data }
      sessionStorage.setItem('sesion',   JSON.stringify(sesion))
      sessionStorage.setItem('paciente', JSON.stringify(data))
      window.dispatchEvent(new Event('storage'))
      navigate('/buscar')
    } catch (err) {
      setError(err.response?.status === 404
        ? 'CI no encontrado. ¿Todavía no te registraste?'
        : 'Error al conectar con el servidor.')
    } finally { setLoading(false) }
  }

  // ── Médico ────────────────────────────────────────────────────────────────
  const handleMedico = async (e) => {
    e.preventDefault()
    if (!medicoId.trim()) { setError('Ingresá tu ID de médico.'); return }
    setLoading(true); setError('')
    try {
      const data   = await medicoService.getById(Number(medicoId))
      const sesion = { rol: 'MEDICO', nombre: `${data.nombre} ${data.apellido}`, id: data.id, ...data }
      sessionStorage.setItem('sesion', JSON.stringify(sesion))
      window.dispatchEvent(new Event('storage'))
      navigate('/medico')
    } catch (err) {
      setError(err.response?.status === 404
        ? 'Médico no encontrado. Verificá tu ID.'
        : 'Error al conectar con el servidor.')
    } finally { setLoading(false) }
  }

  // ── Personal interno ──────────────────────────────────────────────────────
  const handlePersonal = (e) => {
    e.preventDefault()
    const usuario = USUARIOS_DEMO.find(u => u.email === email && u.password === password)
    if (!usuario) { setError('Email o contraseña incorrectos.'); return }
    personalStore.login({
      id:     null,
      email:  usuario.email,
      rol:    usuario.rol,
      nombre: usuario.nombre,
      ...(usuario.medicoId != null && { medicoId: usuario.medicoId }),
    })
    if (usuario.rol === 'SECRETARIA')     navigate('/secretaria')
    if (usuario.rol === 'MEDICO')         navigate('/medico')
    if (usuario.rol === 'ADMINISTRATIVO') navigate('/admin')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%,    rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 60%  20%,  rgba(220,234,243,0.4) 0%, transparent 40%)
      `,
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      overflowY: 'auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ position:'absolute', top:'8%',  left:'5%',  width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.18)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'4%', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.12)', pointerEvents:'none' }} />

      {/* Layout dos columnas — igual que Inicio.jsx */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: 'clamp(2.5rem,5vw,4rem) clamp(2rem,5vw,4rem)',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
        gap: 'clamp(2rem,5vw,5rem)',
        alignItems: 'center',
      }}>

        {/* ── Izquierda: hero ── */}
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize:'0.72rem', fontWeight:500, color:'#4a7c9e', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'1rem' }}>
            Portal de salud — Turnos online
          </p>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(2rem,4.5vw,3.5rem)', fontWeight:400, color:'#1c3545', lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 1.5rem' }}>
            Bienvenido/a<br />de nuevo a{' '}
            <em style={{ fontStyle:'italic', color:'#4a7c9e' }}>MediTurnos.</em>
          </h1>
          <p style={{ fontSize:'0.9rem', color:'#4a7c9e', lineHeight:1.8, maxWidth:'360px', fontWeight:300, marginBottom:'2.5rem' }}>
            Ingresá según tu rol para acceder al sistema de turnos.
          </p>
          <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
            {[{ num:'6+', label:'Especialidades' }, { num:'100%', label:'Online' }, { num:'24/7', label:'Disponible' }].map(({ num, label }) => (
              <div key={label}>
                <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.6rem', color:'#1c3545', margin:'0 0 0.1rem', fontWeight:400 }}>{num}</p>
                <p style={{ fontSize:'0.72rem', color:'#7fa3b8', margin:0, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Derecha: card ── */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 16px 60px rgba(74,124,158,0.18)',
            padding: 'clamp(1.75rem,4vw,2.5rem)',
          }}>

            <p style={{ fontSize:'0.72rem', fontWeight:500, color:'#4a7c9e', letterSpacing:'0.14em', textTransform:'uppercase', margin:'0 0 0.5rem' }}>
              Acceso al sistema
            </p>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1.4rem,2.5vw,1.75rem)', fontWeight:400, color:'#1c3545', margin:'0 0 1.25rem' }}>
              Iniciá sesión
            </h2>

            {/* Tabs × 3 */}
            <div style={{ display:'flex', background:'rgba(74,124,158,0.08)', borderRadius:50, padding:4, marginBottom:'1.75rem', gap:4 }}>
              {TABS.map(({ key, label }) => (
                <button key={key} onClick={() => cambiarTab(key)} style={{
                  flex:1, padding:'0.5rem 0.5rem', borderRadius:50, border:'none',
                  background: tab === key ? '#4a7c9e' : 'transparent',
                  color:      tab === key ? '#fff'    : '#4a7c9e',
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize:'0.8rem', fontWeight: tab === key ? 600 : 400,
                  cursor:'pointer', transition:'all 0.2s',
                  boxShadow: tab === key ? '0 4px 14px rgba(74,124,158,0.25)' : 'none',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ height:1, background:'rgba(74,124,158,0.1)', marginBottom:'1.5rem' }} />

            {/* ── TAB PACIENTE ── */}
            {tab === 'PACIENTE' && (
              <form onSubmit={handlePaciente} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <CampoInput label="Carnet de Identidad" name="ci" value={ci}
                  onChange={e => { setCi(e.target.value); setError('') }}
                  placeholder="Ej: 12345678" required />
                {error && <ErrorMsg texto={error} />}
                <BtnSubmit loading={loading} label="Continuar →" />
                <p style={{ textAlign:'center', margin:'0.25rem 0 0', fontSize:'0.82rem', color:'#7fa3b8' }}>
                  ¿Primera vez?{' '}
                  <button onClick={() => navigate('/')} style={linkBtn}>Registrate aquí</button>
                </p>
              </form>
            )}

            {/* ── TAB MÉDICO ── */}
            {tab === 'MEDICO' && (
              <form onSubmit={handleMedico} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <CampoInput label="ID de médico" name="medicoId" type="number" value={medicoId}
                  onChange={e => { setMedicoId(e.target.value); setError('') }}
                  placeholder="Ej: 1" required />
                <p style={{ fontSize:'0.74rem', color:'#b0c8d4', margin:'-0.5rem 0 0', paddingLeft:'0.25rem' }}>
                  ID numérico asignado por tu institución.
                </p>
                {error && <ErrorMsg texto={error} />}
                <BtnSubmit loading={loading} label="Ingresar como médico →" />
              </form>
            )}

            {/* ── TAB PERSONAL ── */}
            {tab === 'PERSONAL' && (
              <form onSubmit={handlePersonal} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <CampoInput label="Correo institucional" name="email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="usuario@clinica.com" required />
                <CampoInput label="Contraseña" name="password" type="password" value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••" required />
                {error && <ErrorMsg texto={error} />}
                <BtnSubmit loading={false} label="Ingresar →" />
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

const linkBtn = {
  background:'none', border:'none', padding:0, cursor:'pointer',
  fontSize:'0.82rem', color:'#4a7c9e', fontWeight:500,
  fontFamily:"'DM Sans',sans-serif", textDecoration:'underline', textUnderlineOffset:3,
}

function ErrorMsg({ texto }) {
  return (
    <p style={{ fontSize:'0.82rem', color:'#dc2626', margin:0, padding:'0.65rem 1rem', background:'rgba(220,38,38,0.06)', border:'1.5px solid rgba(220,38,38,0.2)', borderRadius:12 }}>
      ⚠ {texto}
    </p>
  )
}

function BtnSubmit({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:'100%', padding:'0.9rem', borderRadius:50, border:'none',
      background: loading ? 'rgba(74,124,158,0.45)' : '#4a7c9e',
      color:'white', fontSize:'0.88rem', fontWeight:500,
      cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.04em',
      transition:'all 0.22s', marginTop:'0.25rem',
    }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#3a6282' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background='#4a7c9e' }}
    >
      {loading ? 'Verificando...' : label}
    </button>
  )
}