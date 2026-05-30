// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'

import LoginPage         from './pages/auth/LoginPage'
import GestionAgendaPage from './pages/agenda/GestionAgendaPage'
import VistaMedico       from './pages/medico/VistaMedico'
import VistaPaciente     from './pages/medico/VistaPaciente'

import Navbar        from './components/Navbar'
import Inicio        from './pages/Inicio'
import BuscarMedico  from './pages/BuscarMedico'
import MisTurnos     from './pages/MisTurnos'
import CalendarioPage from './pages/CalendarioPage'

import DashboardAdmin     from './pages/admin/DashboardAdmin'

// Descomentar cuando Adri haga DashboardSecretaria osea nunca
// import DashboardSecretaria from './pages/secretaria/DashboardSecretaria'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-contenido">
          <Routes>
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/"               element={<Inicio />} />
            <Route path="/buscar"         element={<BuscarMedico />} />
            <Route path="/mis-turnos"     element={<MisTurnos />} />
            <Route path="/agenda"         element={<GestionAgendaPage />} />
            <Route path="/calendario"     element={<CalendarioPage />} />

            <Route path="/medico"         element={<VistaMedico />} />
            <Route path="/paciente/turnos" element={<VistaPaciente />} />

            <Route path="/admin"      element={<DashboardAdmin />} />
            {/* <Route path="/secretaria" element={<DashboardSecretaria />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App