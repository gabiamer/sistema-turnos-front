// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'

import LoginPage         from './pages/auth/LoginPage'
import GestionAgendaPage from './pages/agenda/GestionAgendaPage'
import VistaMedico       from './pages/medico/VistaMedico'
import VistaPaciente     from './pages/medico/VistaPaciente'

import Navbar        from './components/Navbar'
import Inicio        from './pages/Inicio'
import BuscarMedico  from './pages/BuscarMedico'
import CalendarioPage from './pages/CalendarioPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-contenido">
          <Routes>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/"                element={<Inicio />} />
            <Route path="/buscar"          element={<BuscarMedico />} />
            <Route path="/paciente/turnos" element={<VistaPaciente />} />
            <Route path="/mis-turnos"      element={<Navigate to="/paciente/turnos" replace />} />
            <Route path="/agenda"          element={<GestionAgendaPage />} />
            <Route path="/calendario"      element={<CalendarioPage />} />
            <Route path="/medico"          element={<VistaMedico />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
