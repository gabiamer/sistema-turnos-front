// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'

import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import BuscarMedico from './pages/BuscarMedico'
import MisTurnos from './pages/MisTurnos'
import CalendarioPage from './pages/CalendarioPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-contenido">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/buscar" element={<BuscarMedico />} />
            <Route path="/mis-turnos" element={<MisTurnos />} />
            <Route path="/calendario" element={<CalendarioPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App