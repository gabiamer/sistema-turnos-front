// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom'

const linkStyle = (isActive) => ({
  color: isActive ? '#bfdbfe' : 'white',
  fontWeight: isActive ? '600' : '400',
  fontSize: '0.95rem',
})

function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#2563eb',
      padding: '0 1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        <NavLink to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
          🏥 MediTurnos
        </NavLink>

        <ul style={{ display: 'flex', listStyle: 'none', gap: '1.5rem', margin: 0, padding: 0 }}>
          <li>
            <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/buscar" style={({ isActive }) => linkStyle(isActive)}>
              Buscar Médico
            </NavLink>
          </li>
          <li>
            <NavLink to="/paciente/turnos" style={({ isActive }) => linkStyle(isActive)}>
              Mis Turnos
            </NavLink>
          </li>
          <li>
            <NavLink to="/medico" style={({ isActive }) => linkStyle(isActive)}>
              Vista Médico
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar