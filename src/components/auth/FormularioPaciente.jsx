// src/components/auth/FormularioPaciente.jsx
// Prop `inline`: cuando es true, no renderiza card propio (se usa dentro del LoginPage).
// Prop `ciInicial`: pre-rellena el CI si vino del intento de login.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService } from '../../services/pacienteService'
import CampoInput from '../formulario/CampoInput'

const FormularioPaciente = ({ ciInicial = '', inline = false }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    ci: ciInicial, nombre: '', apellido: '',
    fechaNacimiento: '', telefono: '', email: '',
  })
  const [pacienteRegistrado, setPacienteRegistrado] = useState(null)
  const [loading, setLoading]                       = useState(false)
  const [errorRegistro, setErrorRegistro]           = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setErrorRegistro('')
    try {
      const nuevo = await pacienteService.registrar(formData)
      const sesion = { rol: 'PACIENTE', nombre: nuevo.nombre, ...nuevo }
      sessionStorage.setItem('sesion',   JSON.stringify(sesion))
      sessionStorage.setItem('paciente', JSON.stringify(nuevo))
      window.dispatchEvent(new Event('storage'))
      setPacienteRegistrado(nuevo)
    } catch (error) {
      if (error.response?.status === 409)
        setErrorRegistro('Ya existe un paciente con ese CI o email.')
      else
        setErrorRegistro('Error al registrar. Intentá de nuevo.')
    } finally { setLoading(false) }
  }

  // ── Éxito ──────────────────────────────────────────────────────────────────
  if (pacienteRegistrado) {
    return (
      <Wrapper inline={inline}>
        <div style={{ textAlign:'center', padding:'1.5rem 0', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.85rem' }}>
          <div style={{
            width:48, height:48, borderRadius:'50%',
            backgroundColor:'rgba(34,197,94,0.1)',
            border:'1.5px solid rgba(34,197,94,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.3rem', color:'#16a34a',
          }}>✓</div>
          <p style={{ ...s.eyebrow, color:'#16a34a' }}>Registro exitoso</p>
          <p style={s.titulo}>Bienvenido/a, {pacienteRegistrado.nombre}.</p>
          <p style={s.subtitulo}>Ya podés buscar un médico y reservar tu turno.</p>
          <button
            onClick={() => navigate('/buscar')}
            style={s.btnPrimario}
          >
            Buscar un médico →
          </button>
        </div>
      </Wrapper>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <Wrapper inline={inline}>
      {!inline && (
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={s.eyebrow}>Nuevo registro</p>
          <h3 style={s.titulo}>Completá tus datos</h3>
          <p style={s.subtitulo}>No encontramos tu perfil. Ingresá tu información para continuar.</p>
        </div>
      )}

      {inline && (
        <>
          <div style={{ height:1, background:'rgba(74,124,158,0.1)', margin:'0 0 1.25rem' }} />
          <p style={s.eyebrow}>Nuevo registro</p>
          <p style={{ ...s.titulo, fontSize:'1.1rem', marginBottom:'0.25rem' }}>Completá tus datos</p>
          <p style={{ ...s.subtitulo, marginBottom:'1.25rem' }}>Ingresá tu información para crear tu cuenta.</p>
        </>
      )}

      {errorRegistro && (
        <div style={{
          padding:'0.7rem 1rem', borderRadius:10, marginBottom:'1rem',
          background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.2)',
          color:'#dc2626', fontSize:'0.82rem',
        }}>
          ⚠ {errorRegistro}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
        <CampoInput
          name="ci" label="CI" value={formData.ci}
          onChange={handleChange} placeholder="Ej: 12345678" required
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' }}>
          <CampoInput name="nombre"   label="Nombre"   value={formData.nombre}   onChange={handleChange} placeholder="Nombre"   required />
          <CampoInput name="apellido" label="Apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
        </div>
        <CampoInput name="fechaNacimiento" label="Fecha de nacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} required />
        <CampoInput name="telefono" label="Teléfono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 70012345" required />
        <CampoInput name="email" label="Email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" required />

        <div style={{ height:1, background:'rgba(74,124,158,0.1)', margin:'0.25rem 0' }} />

        <button type="submit" disabled={loading} style={{
          ...s.btnPrimario,
          opacity: loading ? 0.6 : 1,
          cursor:  loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </Wrapper>
  )
}

// Wrapper: con card propio si no es inline, transparente si es inline
function Wrapper({ inline, children }) {
  if (inline) {
    return <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>{children}</div>
  }
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.62)',
      backdropFilter:  'blur(16px)',
      borderRadius:    20, padding:'1.75rem',
      border:          '1.5px solid rgba(255,255,255,0.9)',
      boxShadow:       '0 4px 24px rgba(74,124,158,0.1)',
      fontFamily:      "'DM Sans','Helvetica Neue',sans-serif",
      marginTop:       '1.5rem',
    }}>
      {children}
    </div>
  )
}

const s = {
  eyebrow: {
    fontSize:'0.7rem', fontWeight:500, color:'#4a7c9e',
    letterSpacing:'0.12em', textTransform:'uppercase',
    margin:'0 0 0.4rem',
  },
  titulo: {
    fontFamily:"'DM Serif Display',Georgia,serif",
    fontSize:'1.25rem', fontWeight:400, color:'#1c3545',
    margin:'0 0 0.3rem', letterSpacing:'-0.01em',
  },
  subtitulo: {
    fontSize:'0.82rem', color:'#7fa3b8', margin:0, fontWeight:300,
  },
  btnPrimario: {
    width:'100%', padding:'0.9rem', borderRadius:50, border:'none',
    background:'linear-gradient(135deg,#4a7c9e,#3a6282)',
    color:'white', fontSize:'0.88rem', fontWeight:500,
    fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.04em',
    transition:'all 0.2s',
  },
}

export default FormularioPaciente