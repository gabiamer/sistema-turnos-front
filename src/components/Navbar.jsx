// src/components/Navbar.jsx
// Estética editorial pastel — DM Serif Display + DM Sans
// Links condicionales según rol guardado en sessionStorage:
//   { rol: 'PACIENTE' } → Inicio, Buscar médico, Mis turnos
//   { rol: 'MEDICO'   } → Inicio, Mi agenda, Vista médico
//   sin sesión         → Inicio, Buscar médico

import { useState } from 'react'
import { NavLink }  from 'react-router-dom'

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

const LINKS_PACIENTE = [
  { to: '/',                label: 'Inicio',        end: true  },
  { to: '/buscar',          label: 'Buscar médico', end: false },
  { to: '/paciente/turnos', label: 'Mis turnos',    end: false },
]

const LINKS_MEDICO = [
  { to: '/',       label: 'Inicio',       end: true  },
  { to: '/agenda', label: 'Mi agenda',    end: false },
  { to: '/medico', label: 'Vista médico', end: false },
]

const LINKS_DEFAULT = [
  { to: '/',       label: 'Inicio',        end: true  },
  { to: '/buscar', label: 'Buscar médico', end: false },
]

function getLinks() {
  try {
    const sesion = sessionStorage.getItem('sesion')
    if (!sesion) return LINKS_DEFAULT
    const { rol } = JSON.parse(sesion)
    if (rol === 'MEDICO')   return LINKS_MEDICO
    if (rol === 'PACIENTE') return LINKS_PACIENTE
  } catch { /* sesion corrupta */ }
  return LINKS_DEFAULT
}

export default function Navbar() {
  // Re-render cuando cambia sessionStorage (login/logout en la misma pestaña)
  const [, forceUpdate] = useState(0)
  const links = getLinks()

  // Escuchar cambios de storage desde otras pestañas
  // (para la misma pestaña, LoginPage llama a forceUpdate directamente si lo necesita)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', () => forceUpdate(n => n + 1), { once: false })
  }

  return (
    <nav style={{
      backgroundColor: 'rgba(255,255,255,0.72)',
      backdropFilter:  'blur(20px)',
      borderBottom:    '1px solid rgba(74,124,158,0.15)',
      boxShadow:       '0 2px 20px rgba(74,124,158,0.08)',
      position:        'sticky',
      top:             0,
      zIndex:          100,
      fontFamily:      "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{fontImport}</style>

      <div style={{
        maxWidth:       '1400px',
        margin:         '0 auto',
        padding:        '0 clamp(1.25rem, 4vw, 3rem)',
        height:         '64px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width:          '32px',
            height:         '32px',
            borderRadius:   '10px',
            backgroundColor:'rgba(74,124,158,0.12)',
            border:         '1.5px solid rgba(74,124,158,0.25)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '0.95rem',
          }}>
            ✚
          </div>
          <span style={{
            fontFamily:    "'DM Serif Display', Georgia, serif",
            fontSize:      '1.1rem',
            fontWeight:    '400',
            color:         '#1c3545',
            letterSpacing: '-0.01em',
          }}>
            MediTurnos
          </span>
        </NavLink>

        {/* Links según rol */}
        <ul style={{ display: 'flex', listStyle: 'none', gap: '0.25rem', margin: 0, padding: 0 }}>
          {links.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display:        'block',
                  padding:        '0.45rem 1rem',
                  borderRadius:   '50px',
                  fontSize:       '0.85rem',
                  fontWeight:     isActive ? '600' : '400',
                  color:          isActive ? '#1c3545' : '#4a7c9e',
                  backgroundColor:isActive ? 'rgba(74,124,158,0.1)' : 'transparent',
                  border:         isActive ? '1.5px solid rgba(74,124,158,0.25)' : '1.5px solid transparent',
                  textDecoration: 'none',
                  transition:     'all 0.18s ease',
                  letterSpacing:  '0.01em',
                  whiteSpace:     'nowrap',
                })}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA: Ingresar o cerrar sesión */}
        <SesionButton onLogout={() => forceUpdate(n => n + 1)} />
      </div>
    </nav>
  )
}

function SesionButton({ onLogout }) {
  const sesionRaw = sessionStorage.getItem('sesion')
  let nombre = null
  try {
    if (sesionRaw) nombre = JSON.parse(sesionRaw)?.nombre
  } catch { /* corrupta */ }

  if (nombre) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#4a7c9e', fontWeight: '500' }}>
          {nombre}
        </span>
        <button
          onClick={() => {
            sessionStorage.removeItem('sesion')
            sessionStorage.removeItem('paciente')
            onLogout()
            window.location.href = '/login'
          }}
          style={{
            padding:        '0.45rem 1rem',
            borderRadius:   '50px',
            border:         '1.5px solid rgba(74,124,158,0.4)',
            background:     'transparent',
            color:          '#4a7c9e',
            fontSize:       '0.82rem',
            fontWeight:     '500',
            cursor:         'pointer',
            fontFamily:     "'DM Sans', sans-serif",
            letterSpacing:  '0.04em',
          }}
        >
          Salir
        </button>
      </div>
    )
  }

  return (
    <NavLink
      to="/login"
      style={{
        padding:        '0.5rem 1.25rem',
        borderRadius:   '50px',
        border:         '1.5px solid #4a7c9e',
        background:     '#4a7c9e',
        color:          'white',
        fontSize:       '0.82rem',
        fontWeight:     '500',
        textDecoration: 'none',
        letterSpacing:  '0.04em',
        transition:     'all 0.22s ease',
        fontFamily:     "'DM Sans', sans-serif",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#3a6282'; e.currentTarget.style.borderColor = '#3a6282' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#4a7c9e'; e.currentTarget.style.borderColor = '#4a7c9e' }}
    >
      Ingresar
    </NavLink>
  )
}
