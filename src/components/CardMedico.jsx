// src/components/CardMedico.jsx
function CardMedico({ medico, onVerDisponibilidad }) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Avatar inicial */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
      }}>
        {medico.nombre[0]}{medico.apellido[0]}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
        Dr/a. {medico.nombre} {medico.apellido}
      </h3>

      <span style={{
        display: 'inline-block',
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '500',
        width: 'fit-content',
      }}>
        {medico.especialidad}
      </span>

      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{medico.email}</p>

      <button
        style={{
          marginTop: '0.75rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
        }}
        onClick={() => onVerDisponibilidad && onVerDisponibilidad(medico)}
      >
        Ver disponibilidad
      </button>
    </div>
  )
}

export default CardMedico