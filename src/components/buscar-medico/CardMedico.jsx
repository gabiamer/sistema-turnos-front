// src/components/buscar-medico/CardMedico.jsx
import { useState } from 'react'

function Estrellas({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#c9a96e' : '#dde8ef'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: '0.72rem', color: '#7fa3b8', marginLeft: '0.3rem', fontWeight: '400' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

const INITIALS_BG = [
  '#daeaf3', '#d4e8e0', '#e8daf0', '#f0e8da', '#dae0f0', '#f0dad8'
]
const INITIALS_COLOR = [
  '#3a6e8a', '#2e6e5a', '#6a4a8a', '#8a6a3a', '#3a4e8a', '#8a3a42'
]

function CardMedico({ medico, onVerDisponibilidad }) {
  const [hovered, setHovered] = useState(false)
  const idx = medico.id % INITIALS_BG.length
  const rating = 3.5 + (medico.id * 0.3) % 1.5

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'white' : 'rgba(255,255,255,0.72)',
        borderRadius: '20px',
        padding: '2rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: `1.5px solid ${hovered ? 'rgba(74,124,158,0.3)' : 'rgba(255,255,255,0.9)'}`,
        boxShadow: hovered
          ? '0 16px 48px rgba(74,124,158,0.16)'
          : '0 2px 16px rgba(74,124,158,0.07)',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
      }}
    >
      {/* Avatar + nombre */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
          backgroundColor: INITIALS_BG[idx],
          color: INITIALS_COLOR[idx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '1.05rem',
          fontFamily: "'DM Serif Display', Georgia, serif",
          letterSpacing: '0.02em',
        }}>
          {medico.nombre[0]}{medico.apellido[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '1rem', fontWeight: '600', color: '#1c3545',
            margin: '0 0 0.2rem',
            fontFamily: "'DM Serif Display', Georgia, serif",
            lineHeight: 1.25,
          }}>
            Dr. {medico.nombre} {medico.apellido}
          </h3>
          <Estrellas rating={rating} />
        </div>
      </div>

      {/* Especialidad */}
      <div>
        <span style={{
          fontSize: '0.76rem', fontWeight: '500',
          color: '#4a7c9e',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {medico.especialidad}
        </span>
      </div>

      {/* Separador fino */}
      <div style={{ height: '1px', backgroundColor: 'rgba(74,124,158,0.1)' }} />

      {/* Disponibilidad visual */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {['Lu','Ma','Mi','Ju','Vi'].map((d, i) => {
          const disponible = (medico.id + i) % 3 !== 0
          return (
            <div key={d} style={{
              width: '30px', height: '30px', borderRadius: '8px',
              backgroundColor: disponible ? 'rgba(74,124,158,0.1)' : 'rgba(74,124,158,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: disponible ? '600' : '400',
              color: disponible ? '#4a7c9e' : '#b0c8d4',
              fontFamily: "'DM Sans', sans-serif",
              border: `1px solid ${disponible ? 'rgba(74,124,158,0.2)' : 'transparent'}`,
            }}>{d}</div>
          )
        })}
      </div>

      {/* Botón */}
      <button
        onClick={() => onVerDisponibilidad && onVerDisponibilidad(medico)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '50px',
          border: '1.5px solid #4a7c9e',
          background: hovered ? '#4a7c9e' : 'transparent',
          color: hovered ? 'white' : '#4a7c9e',
          fontSize: '0.82rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.22s ease',
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          letterSpacing: '0.04em',
          marginTop: '0.25rem',
        }}
      >
        Reservar turno
      </button>
    </div>
  )
}

export default CardMedico