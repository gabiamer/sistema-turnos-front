// src/pages/auth/LoginPage.jsx
// Rediseño editorial pastel — consistente con BuscarMedico y FormularioPaciente

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { pacienteService }     from '../../services/pacienteService'
import FormularioPaciente      from '../../components/auth/FormularioPaciente'

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

export default function LoginPage() {
  const navigate = useNavigate()
  const [ci, setCi]                             = useState('')
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const [pacienteNoExiste, setPacienteNoExiste] = useState(false)
  const [paciente, setPaciente]                 = useState(null)
  const [focused, setFocused]                   = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const handleBuscar = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setPacienteNoExiste(false)
    try {
      const data = await pacienteService.buscarPorCi(ci)
      sessionStorage.setItem('paciente', JSON.stringify(data))
      setPaciente(data)
      navigate('/buscar')
    } catch (err) {
      if (err.response?.status === 404) setPacienteNoExiste(true)
      else setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      background: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%,    rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 60%  20%,  rgba(220,234,243,0.4) 0%, transparent 40%)
      `,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '1.25rem',
      fontFamily:     "'DM Sans', 'Helvetica Neue', sans-serif",
      overflowY:      'auto',
    }}>
      <style>{`
        ${fontImport}
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .login-input:focus {
          border-color: rgba(122,176,200,0.9) !important;
          box-shadow: 0 4px 24px rgba(74,124,158,0.18) !important;
        }
      `}</style>

      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute', top: '10%', left: '8%',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '12%', right: '6%',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)', pointerEvents: 'none',
      }} />

      {/* Card principal */}
      <div style={{
        width:           '100%',
        maxWidth:        '460px',
        background:      'rgba(255,255,255,0.72)',
        backdropFilter:  'blur(20px)',
        borderRadius:    '28px',
        border:          '1.5px solid rgba(255,255,255,0.9)',
        boxShadow:       '0 16px 60px rgba(74,124,158,0.18)',
        padding:         'clamp(1.75rem, 5vw, 2.75rem)',
        animation:       'fadeUp 0.5s ease both',
        position:        'relative',
        zIndex:          1,
      }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: '500',
            color: '#4a7c9e', letterSpacing: '0.14em',
            textTransform: 'uppercase', marginBottom: '0.6rem',
          }}>
            Portal de salud — Turnos online
          </p>
          <h1 style={{
            fontFamily:    "'DM Serif Display', Georgia, serif",
            fontSize:      'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight:    '400',
            color:         '#1c3545',
            lineHeight:    1.15,
            letterSpacing: '-0.02em',
            margin:        '0 0 0.6rem',
          }}>
            Bienvenido/a a<br />
            <em style={{ fontStyle: 'italic', color: '#4a7c9e' }}>MediTurnos.</em>
          </h1>
          <p style={{
            fontSize: '0.88rem', color: '#7fa3b8',
            lineHeight: 1.6, fontWeight: '300', margin: 0,
          }}>
            Ingresá tu Carnet de Identidad para acceder a tus turnos o buscar un médico.
          </p>
        </div>

        {/* Separador */}
        <div style={{ height: '1px', background: 'rgba(74,124,158,0.1)', marginBottom: '1.75rem' }} />

        {/* Form */}
        <form onSubmit={handleBuscar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display:      'block',
              fontSize:     '0.75rem',
              fontWeight:   '500',
              color:        '#4a7c9e',
              letterSpacing:'0.08em',
              textTransform:'uppercase',
              marginBottom: '0.5rem',
            }}>
              Carnet de Identidad
            </label>
            <div style={{ position: 'relative' }}>
              {/* Ícono */}
              <svg style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)',
                width: '16px', height: '16px',
                color: focused ? '#4a7c9e' : '#a8c4d4',
                transition: 'color 0.2s', pointerEvents: 'none',
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8"/>
                <circle cx="9" cy="11" r="2" strokeWidth="1.8"/>
                <path d="M13 9h4M13 13h4M7 17h10" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="login-input"
                value={ci}
                onChange={e => setCi(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Ej: 12345678"
                required
                style={{
                  width:        '100%',
                  padding:      '0.9rem 1rem 0.9rem 2.8rem',
                  borderRadius: '14px',
                  border:       '1.5px solid rgba(255,255,255,0.8)',
                  background:   'rgba(255,255,255,0.92)',
                  fontSize:     '0.95rem',
                  color:        '#1c3545',
                  fontFamily:   "'DM Sans', sans-serif",
                  outline:      'none',
                  transition:   'all 0.25s',
                  boxSizing:    'border-box',
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{
              fontSize: '0.82rem', color: '#dc2626', margin: 0,
              padding: '0.6rem 0.9rem',
              background: 'rgba(239,68,68,0.06)',
              borderRadius: '10px',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width:          '100%',
              padding:        '0.9rem',
              borderRadius:   '50px',
              border:         'none',
              background:     loading
                ? 'rgba(74,124,158,0.5)'
                : 'linear-gradient(135deg, #4a7c9e 0%, #3a6282 100%)',
              color:          'white',
              fontSize:       '0.9rem',
              fontWeight:     '500',
              cursor:         loading ? 'not-allowed' : 'pointer',
              fontFamily:     "'DM Sans', sans-serif",
              letterSpacing:  '0.04em',
              transition:     'all 0.22s ease',
              marginTop:      '0.25rem',
            }}
          >
            {loading ? 'Buscando...' : 'Continuar →'}
          </button>
        </form>

        {/* Paciente encontrado */}
        {paciente && (
          <div style={{
            marginTop:    '1.25rem',
            padding:      '1rem 1.25rem',
            background:   'rgba(34,197,94,0.06)',
            border:       '1px solid rgba(34,197,94,0.2)',
            borderRadius: '16px',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'space-between',
            gap:          '1rem',
          }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                Perfil encontrado
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1c3545', margin: 0 }}>
                {paciente.nombre} {paciente.apellido}
              </p>
            </div>
            <button
              onClick={() => navigate('/paciente/turnos')}
              style={{
                padding:       '0.5rem 1.1rem',
                borderRadius:  '50px',
                border:        '1.5px solid #4a7c9e',
                background:    '#4a7c9e',
                color:         'white',
                fontSize:      '0.8rem',
                fontWeight:    '500',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                fontFamily:    "'DM Sans', sans-serif",
              }}
            >
              Ver turnos →
            </button>
          </div>
        )}

        {/* Paciente no existe → formulario de registro */}
        {pacienteNoExiste && <FormularioPaciente ciInicial={ci} />}

        {/* Footer nota */}
        <p style={{
          fontSize: '0.72rem', color: '#b0c8d4',
          textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.5,
        }}>
          Sistema de gestión de turnos médicos
        </p>
      </div>
    </div>
  )
}