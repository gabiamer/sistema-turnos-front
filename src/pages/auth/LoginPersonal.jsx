import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { personalStore } from '../../store/personalStore'

// Usuarios de demo — en Fase 2 reemplazar por llamada al back
const USUARIOS_DEMO = [
  { email: 'maria.lopez@clinica.com',  password: 'secretaria123', rol: 'SECRETARIA',     nombre: 'María López' },
  { email: 'carlos.ruiz@clinica.com',  password: 'secretaria123', rol: 'SECRETARIA',     nombre: 'Carlos Ruiz' },
  { email: 'admin@clinica.com',        password: 'admin123',      rol: 'ADMINISTRATIVO', nombre: 'Director Clínica' },
  { email: 'medico@clinica.com',       password: 'medico123',     rol: 'MEDICO',         nombre: 'Dr. Médico', medicoId: 1 },
]

export default function LoginPersonal() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const usuario = USUARIOS_DEMO.find(
      u => u.email === email && u.password === password
    )
    if (!usuario) {
      setError('Email o contraseña incorrectos.')
      return
    }
    personalStore.login({
      id:       null,
      email:    usuario.email,
      rol:      usuario.rol,
      nombre:   usuario.nombre,
      ...(usuario.medicoId != null && { medicoId: usuario.medicoId }),
    })
    if (usuario.rol === 'SECRETARIA')     navigate('/secretaria')
    if (usuario.rol === 'MEDICO')         navigate('/medico')
    if (usuario.rol === 'ADMINISTRATIVO') navigate('/admin')
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.icon}>🏥</div>
          <h1 style={s.title}>Acceso Personal</h1>
          <p style={s.subtitle}>Ingrese sus credenciales institucionales</p>
        </div>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.label}>Correo institucional</label>
            <input
              type="email"
              placeholder="usuario@clinica.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              style={s.input}
              required
              autoFocus
            />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              style={s.input}
              required
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.button}>
            Ingresar
          </button>
        </form>

        <p style={s.linkTexto}>
          <Link to="/login" style={s.link}>¿Eres paciente? Ingresa con tu CI →</Link>
        </p>
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
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden',
  },
  card: {
    width: '100%', maxWidth: '440px',
    backgroundColor: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)', borderRadius: '24px',
    padding: '50px 40px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  header:   { textAlign: 'center', marginBottom: '32px' },
  icon:     { fontSize: '52px', marginBottom: '16px' },
  title:    { color: '#0F172A', fontSize: '26px', fontWeight: '700', margin: '0 0 8px' },
  subtitle: { color: '#64748B', fontSize: '15px', margin: 0, lineHeight: '1.45' },
  form:     { display: 'flex', flexDirection: 'column', width: '100%' },
  inputGroup: { width: '100%', marginBottom: '18px' },
  label:  { display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' },
  input:  {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none',
    backgroundColor: '#F8FAFC', boxSizing: 'border-box', color: '#1e293b',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%', padding: '14px',
    borderRadius: '12px', border: 'none', backgroundColor: '#2563EB',
    color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    transition: 'background 0.2s', marginBottom: '0',
  },
  error:   { color: '#EF4444', textAlign: 'center', marginBottom: '12px', fontWeight: '500', fontSize: '14px' },
  linkTexto: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' },
  link:    { color: '#2563EB', fontWeight: '600', textDecoration: 'none' },
}
