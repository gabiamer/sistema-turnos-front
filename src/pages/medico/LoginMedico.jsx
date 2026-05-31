import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { medicoService } from '../../services/medicoService'

export default function LoginMedico() {
  const navigate = useNavigate()
  const [ci, setCi]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!ci.trim()) return
    setLoading(true); setError('')
    try {
      const medico = await medicoService.buscarPorCi(ci.trim())
      sessionStorage.setItem('medico', JSON.stringify(medico))
      sessionStorage.setItem('rol', 'MEDICO')
      navigate('/medico', { replace: true })
    } catch (err) {
      if (err.response?.status === 404)
        setError('No se encontró ningún médico con ese CI.')
      else
        setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.icon}>👨‍⚕️</div>
          <h1 style={s.title}>Acceso médico</h1>
          <p style={s.subtitle}>Ingresa tu Carnet de Identidad para acceder a tu panel</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.label}>Carnet de Identidad</label>
            <input
              type="text"
              placeholder="Ej: 12345678"
              value={ci}
              onChange={e => { setCi(e.target.value); setError('') }}
              style={s.input}
              required
              autoFocus
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={{ ...s.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
            {loading ? 'Buscando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh', width: '100vw',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px', fontFamily: 'system-ui, sans-serif',
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  },
  card: {
    width: '100%', maxWidth: '420px',
    backgroundColor: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)', borderRadius: '24px',
    padding: '50px 40px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  icon:   { fontSize: '52px', marginBottom: '16px' },
  title:  { color: '#0F172A', fontSize: '24px', fontWeight: '700', margin: '0 0 8px' },
  subtitle: { color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.5' },
  form:   { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  inputGroup: { width: '100%', marginBottom: '20px' },
  label:  { display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' },
  input:  {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none',
    backgroundColor: '#F8FAFC', boxSizing: 'border-box', color: '#1e293b',
  },
  button: {
    width: '100%', padding: '14px',
    borderRadius: '12px', border: 'none', backgroundColor: '#2563EB',
    color: 'white', fontSize: '16px', fontWeight: '700',
    transition: 'background 0.2s',
  },
  error: { color: '#EF4444', fontSize: '13px', fontWeight: '500', marginBottom: '12px', textAlign: 'center' },
}
