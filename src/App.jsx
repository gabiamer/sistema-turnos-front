import './App.css'
import './index.css'

import { Routes, Route, Navigate } from 'react-router-dom'

// Componentes ficticios temporales
const Inicio = () => <div>Inicio</div>
const Buscar = () => <div>Buscar Médicos</div>
const MisTurnos = () => <div>Mis Turnos</div>
const Agenda = () => <div>Agenda Médico</div>

// Rutas definidas
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/buscar" element={<Buscar />} />
      <Route path="/mis-turnos" element={<MisTurnos />} />
      <Route path="/agenda" element={<Agenda />} />

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/inicio" />} />
    </Routes>
  )
}

function App() {
  return (
    <div className="app-container">
      <h1>Sistema de Turnos Médicos</h1>
      <p>Setup del frontend inicializado correctamente.</p>
    </div>
  )
}

export default App