// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const LINKS_PACIENTE = [
  { to: '/buscar',          label: 'Buscar médico' },
  { to: '/paciente/turnos', label: 'Mis turnos'    },
]

const LINKS_MEDICO = [
  { to: '/medico', label: 'Mi agenda'         },
  { to: '/agenda', label: 'Configurar agenda' },
]

const LINKS_SECRETARIA = [
  { to: '/secretaria', label: 'Panel secretaría' },
]

const LINKS_ADMINISTRATIVO = [
  { to: '/admin', label: 'Dashboard admin' },
]

function getSesion() {
  try {
    const raw = sessionStorage.getItem('sesion')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getPersonal() {
  try {
    const raw = sessionStorage.getItem('personal')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function Navbar() {
  const [sesion,   setSesion]   = useState(getSesion)
  const [personal, setPersonal] = useState(getPersonal)
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => {
      setSesion(getSesion())
      setPersonal(getPersonal())
    }
    // Patrón Observer: escucha el evento 'storage'.
    // LoginPage y personalStore.login/logout lo disparan explícitamente en la
    // misma pestaña; el navegador lo dispara de forma nativa entre pestañas.
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  // Personal interno tiene prioridad sobre sesión de paciente
  const usuario = personal || sesion
  const rol     = usuario?.rol ?? null

  const links =
    rol === 'MEDICO'         ? LINKS_MEDICO :
    rol === 'PACIENTE'       ? LINKS_PACIENTE :
    rol === 'SECRETARIA'     ? LINKS_SECRETARIA :
    rol === 'ADMINISTRATIVO' ? LINKS_ADMINISTRATIVO :
    []

  const handleLogout = () => {
    sessionStorage.removeItem('sesion')
    sessionStorage.removeItem('paciente')
    sessionStorage.removeItem('personal')
    setSesion(null)
    setPersonal(null)
    navigate('/', { replace: true })
  }

  // Badge visual por rol
  const rolBadge = {
    MEDICO:         { label: '⚕ Médico',      color: '#4a7c9e', bg: 'rgba(74,124,158,0.1)',   border: 'rgba(74,124,158,0.25)' },
    PACIENTE:       { label: ' Paciente',    color: '#16a34a', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)'  },
    SECRETARIA:     { label: ' Secretaría',  color: '#b45309', bg: 'rgba(180,83,9,0.08)',    border: 'rgba(180,83,9,0.25)'   },
    ADMINISTRATIVO: { label: ' Admin',       color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.25)' },
  }[rol] ?? null

  const logoHref =
    rol === 'MEDICO'         ? '/medico' :
    rol === 'SECRETARIA'     ? '/secretaria' :
    rol === 'ADMINISTRATIVO' ? '/admin' :
    sesion                   ? '/buscar' : '/'

  return (
    <nav style={{
      backgroundColor: 'rgba(255,255,255,0.72)',
      backdropFilter:  'blur(20px)',
      borderBottom:    '1px solid rgba(74,124,158,0.15)',
      boxShadow:       '0 2px 20px rgba(74,124,158,0.08)',
      position:        'sticky',
      top:             0,
      zIndex:          100,
      fontFamily:      "'DM Sans','Helvetica Neue',sans-serif",
    }}>
      <div style={{
        maxWidth:       '1400px',
        margin:         '0 auto',
        padding:        '0 clamp(1.25rem,4vw,3rem)',
        height:         '64px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <NavLink
          to={logoHref}
          style={{ display:'flex', alignItems:'center', gap:'0.6rem', textDecoration:'none' }}
        >
          <div style={{
            width:36, height:36, borderRadius:11,
            backgroundColor:'rgba(74,124,158,0.12)',
            border:'1.5px solid rgba(74,124,158,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1rem',
          }}>✚</div>
          <span style={{
            fontFamily:  "'DM Serif Display',Georgia,serif",
            fontSize:    '1.1rem', fontWeight:'400',
            color:       '#1c3545', letterSpacing:'-0.01em',
          }}>MediTurnos</span>
        </NavLink>

        {/* Links según rol */}
        {links.length > 0 && (
          <ul style={{ display:'flex', listStyle:'none', gap:'0.25rem', margin:0, padding:0 }}>
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} style={({ isActive }) => ({
                  display:'block', padding:'0.45rem 1rem', borderRadius:'50px',
                  fontSize:'0.85rem', fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#1c3545' : '#4a7c9e',
                  backgroundColor: isActive ? 'rgba(74,124,158,0.1)' : 'transparent',
                  border: isActive ? '1.5px solid rgba(74,124,158,0.25)' : '1.5px solid transparent',
                  textDecoration:'none', transition:'all 0.18s ease',
                  whiteSpace:'nowrap',
                })}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* CTA derecha */}
        {usuario ? (
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            {rolBadge && (
              <span style={{
                fontSize:'0.72rem', fontWeight:600,
                color: rolBadge.color,
                background: rolBadge.bg,
                border: `1px solid ${rolBadge.border}`,
                borderRadius:50, padding:'2px 10px',
                letterSpacing:'0.06em', textTransform:'uppercase',
              }}>
                {rolBadge.label}
              </span>
            )}
            <span style={{ fontSize:'0.8rem', color:'#4a7c9e', fontWeight:'500', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {usuario.nombre}
            </span>
            <button onClick={handleLogout} style={{
              padding:'0.45rem 1rem', borderRadius:'50px',
              border:'1.5px solid rgba(74,124,158,0.4)',
              background:'transparent', color:'#4a7c9e',
              fontSize:'0.82rem', fontWeight:'500',
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              letterSpacing:'0.04em', transition:'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='#4a7c9e'; e.currentTarget.style.color='white' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#4a7c9e' }}
            >
              Salir
            </button>
          </div>
        ) : (
          /* Sin sesión */
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <NavLink to="/" style={({ isActive }) => ({
              padding:'0.45rem 1rem', borderRadius:'50px',
              border:'1.5px solid transparent',
              background: isActive ? 'rgba(74,124,158,0.08)' : 'transparent',
              color:'#4a7c9e', fontSize:'0.82rem', fontWeight:'500',
              textDecoration:'none', fontFamily:"'DM Sans',sans-serif",
              letterSpacing:'0.04em', transition:'all 0.18s',
            })}>
              Registrarse
            </NavLink>
            <NavLink to="/login" style={{
              padding:'0.5rem 1.25rem', borderRadius:'50px',
              border:'1.5px solid #4a7c9e', background:'#4a7c9e',
              color:'white', fontSize:'0.82rem', fontWeight:'500',
              textDecoration:'none', letterSpacing:'0.04em',
              transition:'all 0.22s ease', fontFamily:"'DM Sans',sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.background='#3a6282'; e.currentTarget.style.borderColor='#3a6282' }}
              onMouseLeave={e => { e.currentTarget.style.background='#4a7c9e'; e.currentTarget.style.borderColor='#4a7c9e' }}
            >
              Iniciar sesión
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}