// src/components/Navbar.jsx
// Estética editorial pastel — DM Serif Display + DM Sans
// Consistente con BuscarMedico y FormularioPaciente
import { useState } from 'react'
import { NavLink }  from 'react-router-dom'

const LINKS = [
  { to: '/',               label: 'Inicio',        end: true  },
  { to: '/buscar',         label: 'Buscar médico', end: false },
  { to: '/paciente/turnos',label: 'Mis turnos',    end: false },
  { to: '/medico',         label: 'Vista médico',  end: false },
]

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

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

        {/* Links desktop */}
        <ul style={{
          display:    'flex',
          listStyle:  'none',
          gap:        '0.25rem',
          margin:     0,
          padding:    0,
        }}>
          {LINKS.map(({ to, label, end }) => (
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

        {/* CTA */}
        <NavLink
          to="/login"
          style={{
            padding:         '0.5rem 1.25rem',
            borderRadius:    '50px',
            border:          '1.5px solid #4a7c9e',
            background:      '#4a7c9e',
            color:           'white',
            fontSize:        '0.82rem',
            fontWeight:      '500',
            textDecoration:  'none',
            letterSpacing:   '0.04em',
            transition:      'all 0.22s ease',
            fontFamily:      "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3a6282'; e.currentTarget.style.borderColor = '#3a6282' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#4a7c9e'; e.currentTarget.style.borderColor = '#4a7c9e' }}
        >
          Ingresar
        </NavLink>
      </div>
    </nav>
  )
}