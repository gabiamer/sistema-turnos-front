// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'

import LoginPage         from './pages/auth/LoginPage'
import GestionAgendaPage from './pages/agenda/GestionAgendaPage'
import VistaMedico       from './pages/medico/VistaMedico'
import VistaPaciente     from './pages/medico/VistaPaciente'
import Navbar            from './components/Navbar'
import BuscarMedico      from './pages/BuscarMedico'
import Inicio            from './pages/Inicio'

function getSesion() {
  try {
    const raw = sessionStorage.getItem('sesion')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function RutaProtegida({ children, rolRequerido }) {
  const sesion = getSesion()
  if (!sesion) return <Navigate to="/login" replace />
  if (rolRequerido && sesion.rol !== rolRequerido) {
    return <Navigate to={sesion.rol === 'MEDICO' ? '/medico' : '/buscar'} replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-contenido">
          <Routes>
            {/* Home: página de inicio con hero + formulario de registro */}
            <Route path="/" element={<Inicio />} />

            {/* Login: solo para quien ya tiene cuenta */}
            <Route path="/login" element={<LoginPage />} />

            {/* Paciente */}
            <Route path="/buscar" element={
              <RutaProtegida rolRequerido="PACIENTE"><BuscarMedico /></RutaProtegida>
            }/>
            <Route path="/paciente/turnos" element={
              <RutaProtegida rolRequerido="PACIENTE"><VistaPaciente /></RutaProtegida>
            }/>
            <Route path="/mis-turnos" element={<Navigate to="/paciente/turnos" replace />} />

            {/* Médico */}
            <Route path="/medico" element={
              <RutaProtegida rolRequerido="MEDICO"><VistaMedico /></RutaProtegida>
            }/>
            <Route path="/agenda" element={
              <RutaProtegida rolRequerido="MEDICO"><GestionAgendaPage /></RutaProtegida>
            }/>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App