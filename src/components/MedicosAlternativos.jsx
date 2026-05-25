// src/components/MedicosAlternativos.jsx
// Aparece cuando el médico seleccionado no tiene slots en la semana visible

function MedicosAlternativos({ medicos, medicoActualId, onVerDisponibilidad }) {
  const alternativos = medicos.filter(m => m.id !== medicoActualId)

  if (alternativos.length === 0) return null

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.25rem',
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: '12px',
    }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
        🔍 Médicos disponibles en la misma especialidad
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {alternativos.map(medico => (
          <div
            key={medico.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
            }}
          >
            <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>
              Dr/a. {medico.nombre} {medico.apellido}
            </span>
            <button
              onClick={() => onVerDisponibilidad(medico)}
              style={{
                padding: '0.3rem 0.8rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Ver turnos
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MedicosAlternativos