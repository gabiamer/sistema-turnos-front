// src/components/FormularioPaciente.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService } from '../services/pacienteService'
import CampoInput from './formulario/CampoInput'

const camposIniciales = { ci: '', nombre: '', apellido: '', fechaNacimiento: '', telefono: '', email: '' }
const erroresIniciales = { ci: '', email: '' }

function FormularioPaciente({ onEnviar }) {
  const navigate = useNavigate()
  const [form, setForm]               = useState(camposIniciales)
  const [errores, setErrores]         = useState(erroresIniciales)
  const [loading, setLoading]         = useState(false)
  const [errorServidor, setErrorServ] = useState('')

  function validar() {
    const e = { ci: '', email: '' }
    let ok = true
    if (!form.ci.trim()) { e.ci = 'El CI es obligatorio.'; ok = false }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { e.email = 'Email inválido.'; ok = false }
    setErrores(e)
    return ok
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errores[name]) setErrores(p => ({ ...p, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setLoading(true); setErrorServ('')
    try {
      const nuevo = await pacienteService.registrar(form)
      // Guardar sesión con la respuesta real del servidor
      const sesion = { rol: 'PACIENTE', nombre: nuevo.nombre, ...nuevo }
      sessionStorage.setItem('sesion',   JSON.stringify(sesion))
      sessionStorage.setItem('paciente', JSON.stringify(nuevo))
      window.dispatchEvent(new Event('storage'))
      if (onEnviar) onEnviar(nuevo)
      navigate('/buscar')
    } catch (err) {
      if (err.response?.status === 409)        setErrorServ('Ya existe un paciente con ese CI.')
      else if (err.response?.data?.message)    setErrorServ(err.response.data.message)
      else                                     setErrorServ('Error al registrar. Verificá tu conexión.')
    } finally { setLoading(false) }
  }

  return (
    <div style={estiloBase}>
      <style>{fontImport}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={eyebrow}>Datos personales</p>
        <h2 style={titulo}>Información del paciente</h2>
        <p style={subtitulo}>Completá tus datos para continuar con la reserva.</p>
      </div>

      {/* Error servidor */}
      {errorServidor && (
        <div style={{
          padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
          backgroundColor: 'rgba(220,38,38,0.06)',
          border: '1.5px solid rgba(220,38,38,0.2)',
          color: '#dc2626', fontSize: '0.82rem',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {errorServidor}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CampoInput label="CI" name="ci" value={form.ci} onChange={handleChange} placeholder="Ej: 12345678" error={errores.ci} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <CampoInput label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Pedro" />
          <CampoInput label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: Suárez" />
        </div>

        <CampoInput label="Fecha de nacimiento" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} type="date" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <CampoInput label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 70012345" type="tel" />
          <CampoInput label="Email" name="email" value={form.email} onChange={handleChange} placeholder="pedro@mail.com" type="email" error={errores.email} />
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(74,124,158,0.1)', margin: '0.5rem 0' }} />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...btnPrimario,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Guardando...' : 'Registrarse'}
        </button>

        {/* Link a login para quienes ya tienen cuenta */}
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#7fa3b8', margin: '0.25rem 0 0' }}>
          ¿Ya tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '0.82rem', color: '#4a7c9e', fontWeight: 500,
              fontFamily: "'DM Sans',sans-serif", textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Iniciá sesión aquí
          </button>
        </p>
      </form>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

const estiloBase = {
  backgroundColor: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(16px)',
  borderRadius: '24px',
  padding: '2rem',
  maxWidth: '520px',
  border: '1.5px solid rgba(255,255,255,0.9)',
  boxShadow: '0 4px 32px rgba(74,124,158,0.1)',
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
}

const eyebrow = {
  fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  marginBottom: '0.5rem', margin: '0 0 0.5rem',
}

const titulo = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontSize: '1.5rem', fontWeight: '400', color: '#1c3545',
  margin: '0 0 0.4rem', letterSpacing: '-0.01em',
}

const subtitulo = {
  fontSize: '0.85rem', color: '#7fa3b8', margin: 0, fontWeight: '300',
}

const btnPrimario = {
  width: '100%', padding: '0.9rem',
  borderRadius: '50px', border: 'none',
  background: 'linear-gradient(135deg, #4a7c9e, #3a6282)',
  color: 'white', fontSize: '0.88rem', fontWeight: '500',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '0.04em', transition: 'all 0.2s',
}

export default FormularioPaciente