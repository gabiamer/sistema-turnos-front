// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'

import LoginPage         from './pages/auth/LoginPage'
import LoginPersonal     from './pages/auth/LoginPersonal'
import GestionAgendaPage from './pages/agenda/GestionAgendaPage'
import VistaMedico       from './pages/medico/VistaMedico'
import VistaPaciente     from './pages/medico/VistaPaciente'

import Navbar               from './components/Navbar'
import ProtectedRoute       from './components/ProtectedRoute'
import Inicio               from './pages/Inicio'
import BuscarMedico         from './pages/BuscarMedico'
import MisTurnos            from './pages/MisTurnos'
import CalendarioPage       from './pages/CalendarioPage'
import DashboardAdmin       from './pages/admin/DashboardAdmin'
import DashboardSecretaria  from './pages/secretaria/DashboardSecretaria'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-contenido">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/login-personal"  element={<LoginPersonal />} />
            <Route path="/"                element={<Inicio />} />
            <Route path="/buscar"          element={<BuscarMedico />} />
            <Route path="/mis-turnos"      element={<MisTurnos />} />
            <Route path="/agenda"          element={<GestionAgendaPage />} />
            <Route path="/calendario"      element={<CalendarioPage />} />
            <Route path="/paciente/turnos" element={<VistaPaciente />} />

            {/* Rutas protegidas — solo personal hospitalario autenticado */}
            <Route path="/medico" element={
              <ProtectedRoute roles={['MEDICO']}>
                <VistaMedico />
              </ProtectedRoute>
            } />

            <Route path="/secretaria" element={
              <ProtectedRoute roles={['SECRETARIA']}>
                <DashboardSecretaria />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMINISTRATIVO']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App