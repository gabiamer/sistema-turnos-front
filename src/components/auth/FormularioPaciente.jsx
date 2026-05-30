// src/components/auth/FormularioPaciente.jsx
// Drop-in replacement — misma lógica, estética editorial pastel
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService } from '../../services/pacienteService'
import CampoInput from '../formulario/CampoInput'

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

const FormularioPaciente = ({ ciInicial }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    ci: ciInicial || '', nombre: '', apellido: '',
    fechaNacimiento: '', telefono: '', email: '',
  })
  const [pacienteRegistrado, setPacienteRegistrado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorRegistro('')
    try {
      const nuevo = await pacienteService.registrar(formData)
      // Guardar en sessionStorage para que MisTurnos y el resto lo lean
      sessionStorage.setItem('paciente', JSON.stringify(nuevo))
      setPacienteRegistrado(nuevo)
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorRegistro('Ya existe un paciente con ese CI o email.')
      } else {
        setErrorRegistro('Error al registrar. Intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (pacienteRegistrado) {
    return (
      <div style={cardBase}>
        <style>{fontImport}</style>
        <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'rgba(74,124,158,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: '#4a7c9e',
          }}>✓</div>
          <p style={{ ...titulo, fontSize: '1.1rem' }}>Paciente registrado</p>
          <p style={subtitulo}>Bienvenido/a, {pacienteRegistrado.nombre}.</p>
          <button
            onClick={() => navigate('/buscar')}
            style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #4a7c9e, #3a6282)', color: 'white', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            Buscar un médico →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={cardBase}>
      <style>{fontImport}</style>

      <p style={eyebrow}>Nuevo registro</p>
      <h3 style={titulo}>Completá tus datos</h3>
      <p style={{ ...subtitulo, marginBottom: '1.5rem' }}>
        No encontramos tu perfil. Ingresá tu información para continuar.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
          <CampoInput name="nombre" label="Nombre" onChange={handleChange} placeholder="Nombre" required />
          <CampoInput name="apellido" label="Apellido" onChange={handleChange} placeholder="Apellido" required />
        </div>
        <CampoInput name="fechaNacimiento" label="Fecha de nacimiento" type="date" onChange={handleChange} required />
        <CampoInput name="telefono" label="Teléfono" onChange={handleChange} placeholder="Ej: 70012345" required />
        <CampoInput name="email" label="Email" type="email" onChange={handleChange} placeholder="correo@ejemplo.com" required />

        <div style={{ height: '1px', backgroundColor: 'rgba(74,124,158,0.1)', margin: '0.25rem 0' }} />

        {errorRegistro && (
          <p style={{ color: '#dc2626', fontSize: '0.82rem', textAlign: 'center', margin: '0' }}>
            ⚠ {errorRegistro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '0.9rem',
            borderRadius: '50px', border: 'none',
            background: 'linear-gradient(135deg, #4a7c9e, #3a6282)',
            color: 'white', fontSize: '0.88rem', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  )
}

const cardBase = {
  backgroundColor: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(16px)',
  borderRadius: '20px',
  padding: '1.75rem',
  border: '1.5px solid rgba(255,255,255,0.9)',
  boxShadow: '0 4px 24px rgba(74,124,158,0.1)',
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  marginTop: '1.5rem',
}
const eyebrow = { fontSize: '0.7rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.4rem' }
const titulo  = { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.25rem', fontWeight: '400', color: '#1c3545', margin: '0 0 0.3rem' }
const subtitulo = { fontSize: '0.82rem', color: '#7fa3b8', margin: 0, fontWeight: '300' }

export default FormularioPaciente
