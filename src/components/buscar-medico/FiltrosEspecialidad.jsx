// src/components/buscar-medico/FiltrosEspecialidad.jsx
function FiltrosEspecialidad({ especialidades, seleccionada, onCambio }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {especialidades.map(esp => {
        const activo = seleccionada === esp
        return (
          <button
            key={esp}
            onClick={() => onCambio(esp)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '50px',
              border: `1.5px solid ${activo ? '#4a7c9e' : 'rgba(74,124,158,0.25)'}`,
              backgroundColor: activo ? '#4a7c9e' : 'rgba(255,255,255,0.7)',
              color: activo ? 'white' : '#4a7c9e',
              fontSize: '0.8rem',
              fontWeight: activo ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
            }}
          >
            {esp}
          </button>
        )
      })}
    </div>
  )
}

export default FiltrosEspecialidad