import './App.css'
import './index.css'

import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/auth/LoginPage'

const Inicio = () => <div>Inicio</div>
const Buscar = () => <div>Buscar Médicos</div>
const MisTurnos = () => <div>Mis Turnos</div>
const Agenda = () => <div>Agenda Médico</div>

function App() {

  return (

    <Routes>

      <Route path="/" element={<LoginPage />} />

      <Route path="/inicio" element={<Inicio />} />

      <Route path="/buscar" element={<Buscar />} />

      <Route path="/mis-turnos" element={<MisTurnos />} />

      <Route path="/agenda" element={<Agenda />} />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>

  )
}

export default App