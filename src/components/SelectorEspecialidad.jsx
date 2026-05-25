// src/components/SelectorEspecialidad.jsx
function SelectorEspecialidad({ especialidades, seleccionada, onCambio }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label
        htmlFor="especialidad"
        style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}
      >
        Filtrar por especialidad
      </label>
      <select
        id="especialidad"
        value={seleccionada}
        onChange={(e) => onCambio(e.target.value)}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '0.95rem',
          color: '#1e293b',
          backgroundColor: 'white',
          cursor: 'pointer',
          maxWidth: '300px',
        }}
      >
        {especialidades.map(esp => (
          <option key={esp} value={esp}>{esp}</option>
        ))}
      </select>
    </div>
  )
}

export default SelectorEspecialidad