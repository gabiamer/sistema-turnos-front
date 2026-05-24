// src/components/FormularioPaciente.jsx
import { useState } from 'react'
import { pacienteService } from '../services/pacienteService'

const camposIniciales = {
  ci: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
}

const erroresIniciales = {
  ci: '',
  email: '',
}

function FormularioPaciente({ onEnviar }) {
  const [form, setForm] = useState(camposIniciales)
  const [errores, setErrores] = useState(erroresIniciales)
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  function validar() {
    const nuevosErrores = { ci: '', email: '' }
    let valido = true

    if (!form.ci.trim()) {
      nuevosErrores.ci = 'El CI es obligatorio.'
      valido = false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email && !emailRegex.test(form.email)) {
      nuevosErrores.email = 'El email no es válido.'
      valido = false
    }

    setErrores(nuevosErrores)
    return valido
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    setErrorServidor('')

    try {
      await pacienteService.registrar(form)
      setEnviado(true)
      if (onEnviar) onEnviar(form)
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorServidor('Ya existe un paciente registrado con ese CI.')
      } else if (err.response?.data?.message) {
        setErrorServidor(err.response.data.message)
      } else {
        setErrorServidor('Error al registrar. Verificá tu conexión e intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</p>
        <h3 style={{ color: '#16a34a', fontWeight: '600', marginBottom: '0.5rem' }}>
          Datos registrados correctamente
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {form.nombre} {form.apellido} — CI: {form.ci}
        </p>
        <button
          onClick={() => { setForm(camposIniciales); setEnviado(false) }}
          style={{
            marginTop: '1rem',
            padding: '0.4rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Nuevo paciente
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '480px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
    }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
        Datos del Paciente
      </h2>

      {/* Error del servidor */}
      {errorServidor && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '0.875rem',
        }}>
          ⚠ {errorServidor}
        </div>
      )}

      <Campo label="CI *"                name="ci"              value={form.ci}              onChange={handleChange} placeholder="Ej: 12345678"       error={errores.ci} />
      <Campo label="Nombre"              name="nombre"          value={form.nombre}          onChange={handleChange} placeholder="Ej: Pedro" />
      <Campo label="Apellido"            name="apellido"        value={form.apellido}        onChange={handleChange} placeholder="Ej: Suárez" />
      <Campo label="Fecha de nacimiento" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} type="date" />
      <Campo label="Teléfono"            name="telefono"        value={form.telefono}        onChange={handleChange} placeholder="Ej: 70012345" type="tel" />
      <Campo label="Email"               name="email"           value={form.email}           onChange={handleChange} placeholder="Ej: pedro@mail.com" type="email" error={errores.email} />

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Guardando...' : 'Guardar datos'}
      </button>
    </form>
  )
}

function Campo({ label, name, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label htmlFor={name} style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
          fontSize: '0.95rem',
          color: '#1e293b',
          outline: 'none',
          backgroundColor: 'white',
        }}
      />
      {error && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>}
    </div>
  )
}

export default FormularioPaciente