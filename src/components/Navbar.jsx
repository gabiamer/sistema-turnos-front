import { NavLink, useNavigate } from 'react-router-dom'
import { personalStore } from '../store/personalStore'

const linkStyle = (isActive) => ({
  color: isActive ? '#bfdbfe' : 'white',
  fontWeight: isActive ? '600' : '400',
  fontSize: '0.95rem',
})

function Navbar() {
  const personal = personalStore.get()
  const navigate = useNavigate()

  const handleLogout = () => {
    personalStore.logout()
    navigate('/login-personal')
  }

  return (
    <nav style={{
      backgroundColor: '#2563eb',
      padding: '0 1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
      }}>
        <NavLink to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
          🏥 MediTurnos
        </NavLink>

        <ul style={{ display: 'flex', listStyle: 'none', gap: '1.5rem', margin: 0, padding: 0 }}>
          <li><NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>Inicio</NavLink></li>
          <li><NavLink to="/buscar" style={({ isActive }) => linkStyle(isActive)}>Buscar Médico</NavLink></li>
          <li><NavLink to="/paciente/turnos" style={({ isActive }) => linkStyle(isActive)}>Mis Turnos</NavLink></li>
          {personal?.rol === 'MEDICO' && (
            <li><NavLink to="/medico" style={({ isActive }) => linkStyle(isActive)}>Mi panel</NavLink></li>
          )}
          {personal?.rol === 'SECRETARIA' && (
            <li><NavLink to="/secretaria" style={({ isActive }) => linkStyle(isActive)}>Secretaría</NavLink></li>
          )}
          {personal?.rol === 'ADMINISTRATIVO' && (
            <li><NavLink to="/admin" style={({ isActive }) => linkStyle(isActive)}>Administración</NavLink></li>
          )}
        </ul>

        {personal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {personal.nombre} · {personal.rol}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: '0.82rem',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.18s',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
