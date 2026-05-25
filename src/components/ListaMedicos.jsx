// src/components/ListaMedicos.jsx
import CardMedico from './CardMedico'

function ListaMedicos({ medicos, onVerDisponibilidad }) {
  if (medicos.length === 0) {
    return (
      <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>
        No se encontraron médicos para esta especialidad.
      </p>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    }}>
      {medicos.map(medico => (
        <CardMedico key={medico.id} medico={medico} onVerDisponibilidad={onVerDisponibilidad} />
      ))}
    </div>
  )
}

export default ListaMedicos