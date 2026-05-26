// src/components/buscar-medico/ListaMedicosV2.jsx
import CardMedicoV2 from './CardMedicoV2'

function ListaMedicosV2({ medicos, onVerDisponibilidad }) {
  if (medicos.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '5rem 1rem',
        color: '#7fa3b8',
      }}>
        <p style={{
          fontSize: '1.1rem', fontWeight: '300', color: '#4a7c9e',
          fontFamily: "'DM Serif Display', Georgia, serif",
          letterSpacing: '0.01em',
        }}>
          No se encontraron médicos
        </p>
        <p style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#9abccc' }}>
          Probá con otra especialidad o búsqueda
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {medicos.map((medico, i) => (
          <div
            key={medico.id}
            style={{
              animation: 'fadeUp 0.4s ease both',
              animationDelay: `${i * 0.07}s`,
            }}
          >
            <CardMedicoV2 medico={medico} onVerDisponibilidad={onVerDisponibilidad} />
          </div>
        ))}
      </div>
    </>
  )
}

export default ListaMedicosV2