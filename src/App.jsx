// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'

import LoginPage            from './pages/auth/LoginPage'
import GestionAgendaPage    from './pages/agenda/GestionAgendaPage'
import VistaMedico          from './pages/medico/VistaMedico'
import VistaPaciente        from './pages/paciente/VistaPaciente'
import Navbar               from './components/Navbar'
import BuscarMedico         from './pages/BuscarMedico'
import Inicio               from './pages/Inicio'
import DashboardSecretaria  from './pages/secretaria/DashboardSecretaria'
import DashboardAdmin       from './pages/admin/DashboardAdmin'

function getSesion() {
  try { return JSON.parse(sessionStorage.getItem('sesion'))  } catch { return null }
}
function getPersonal() {
  try { return JSON.parse(sessionStorage.getItem('personal')) } catch { return null }
}

// Protege rutas de paciente/médico
function RutaProtegida({ children, rolRequerido }) {
  const sesion = getSesion()
  if (!sesion) return <Navigate to="/login" replace />
  if (rolRequerido && sesion.rol !== rolRequerido)
    return <Navigate to={sesion.rol === 'MEDICO' ? '/medico' : '/buscar'} replace />
  return children
}

// Protege rutas de personal interno (secretaría / admin)
function RutaPersonal({ children, rolRequerido }) {
  const personal = getPersonal()
  if (!personal) return <Navigate to="/login" replace />
  if (rolRequerido && personal.rol !== rolRequerido) {
    if (personal.rol === 'SECRETARIA')     return <Navigate to="/secretaria" replace />
    if (personal.rol === 'ADMINISTRATIVO') return <Navigate to="/admin"       replace />
    if (personal.rol === 'MEDICO')         return <Navigate to="/medico"      replace />
    return <Navigate to="/" replace />
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
            <Route path="/"      element={<Inicio />} />
            <Route path="/login" element={<LoginPage />} />

            {/* login-personal ahora es el mismo login (tab Personal) */}
            <Route path="/login-personal" element={<Navigate to="/login" replace />} />

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

            {/* Secretaría */}
            <Route path="/secretaria" element={
              <RutaPersonal rolRequerido="SECRETARIA"><DashboardSecretaria /></RutaPersonal>
            }/>

            {/* Admin */}
            <Route path="/admin" element={
              <RutaPersonal rolRequerido="ADMINISTRATIVO"><DashboardAdmin /></RutaPersonal>
            }/>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App