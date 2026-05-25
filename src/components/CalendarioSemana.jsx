// src/components/CalendarioSemana.jsx

function CalendarioSemana({ slots, onSlotClick }) {
  if (!slots || slots.length === 0) {
    return (
      <p style={{ color: '#64748b', marginTop: '1rem' }}>
        Sin disponibilidad este período.
      </p>
    )
  }

  const porFecha = slots.reduce((acc, slot) => {
    if (!acc[slot.fecha]) acc[slot.fecha] = []
    acc[slot.fecha].push(slot)
    return acc
  }, {})

  const fechas = Object.keys(porFecha).sort()

  return (
    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${fechas.length}, minmax(110px, 1fr))`,
        gap: '0.75rem',
      }}>
        {fechas.map(fecha => (
          <div key={fecha}>
            <div style={{
              backgroundColor: '#1e40af',
              color: 'white',
              borderRadius: '8px 8px 0 0',
              padding: '0.4rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.78rem',
              fontWeight: '600',
            }}>
              {new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'short', day: 'numeric', month: 'short'
              })}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              padding: '0.4rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0 0 8px 8px',
            }}>
              {porFecha[fecha].map(slot => {
                const bloqueado = slot.bloqueoActivo
                const ocupado = !slot.disponible
                const libre = !bloqueado && !ocupado

                let bg = '#22c55e'
                let color = 'white'
                let cursor = 'pointer'
                let title = 'Disponible — click para reservar'

                if (bloqueado) {
                  bg = '#94a3b8'; cursor = 'not-allowed'; title = 'Bloqueado por el médico'
                } else if (ocupado) {
                  bg = '#e2e8f0'; color = '#94a3b8'; cursor = 'not-allowed'; title = 'Ocupado'
                }

                return (
                  <button
                    key={slot.id}
                    title={title}
                    disabled={!libre}
                    onClick={() => libre && onSlotClick && onSlotClick(slot)}
                    style={{
                      backgroundColor: bg,
                      color,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: '500',
                      cursor,
                      textAlign: 'center',
                      transition: 'opacity 0.15s',
                      opacity: libre ? 1 : 0.6,
                    }}
                  >
                    {slot.hora}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
        <span>🟢 Libre</span>
        <span>⬜ Ocupado</span>
        <span>🔘 Bloqueado</span>
      </div>
    </div>
  )
}

export default CalendarioSemana