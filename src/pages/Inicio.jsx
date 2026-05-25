// src/pages/Inicio.jsx
import { useNavigate } from 'react-router-dom'
import FormularioPaciente from '../components/FormularioPaciente'

function Inicio() {
  const navigate = useNavigate()

  function handlePacienteRegistrado(paciente) {
    // Guardamos el paciente en sessionStorage para que MisTurnos lo lea
    sessionStorage.setItem('paciente', JSON.stringify(paciente))
    // Navegamos a mis turnos luego del registro
    navigate('/mis-turnos')
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Bienvenido al Sistema de Turnos
      </h1>
      <FormularioPaciente onEnviar={handlePacienteRegistrado} />
    </div>
  )
}

export default Inicio