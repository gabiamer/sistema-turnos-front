// src/pages/Inicio.jsx
import FormularioPaciente from '../components/FormularioPaciente'

function Inicio() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Bienvenido al Sistema de Turnos
      </h1>
      <FormularioPaciente />
    </div>
  )
}

export default Inicio