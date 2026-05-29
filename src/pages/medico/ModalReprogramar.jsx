// src/components/medico/ModalReprogramar.jsx
// Light theme — usa clases globales de index.css

import { useState } from 'react'

export default function ModalReprogramar({ turno, slotsDisponibles, onConfirmar, onCerrar, cargando, error }) {
  const [slotElegido, setSlotElegido] = useState(null)

  const libres = (slotsDisponibles ?? []).filter(s => s.disponible && !s.bloqueado)

  const porFecha = libres.reduce((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = []
    acc[s.fecha].push(s.hora)
    return acc
  }, {})
  const fechas = Object.keys(porFecha).sort()

  return (
    <div onClick={onCerrar} className="modal-overlay">
      <div
        onClick={e => e.stopPropagation()}
        className="modal-contenido"
        style={{ maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 18 }}
      >

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--color-primario)', marginBottom: 4 }}>Reprogramar cita</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--color-texto)', margin: 0 }}>
              {turno?.paciente?.nombre}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-texto-muted)', marginTop: 3 }}>
              Actual: {turno?.fecha} — {turno?.hora}
            </p>
          </div>
          <button onClick={onCerrar} style={btnXStyle}>✕</button>
        </div>

        {/* Slots disponibles */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fechas.length === 0 ? (
            <p style={{
              color:        'var(--color-texto-muted)',
              fontSize:     13,
              textAlign:    'center',
              padding:      '1.5rem',
              background:   'var(--color-primario-light)',
              borderRadius: 'var(--radio-md)',
              border:       '1px solid var(--color-borde-medio)',
            }}>
              No hay horarios disponibles esta semana.
            </p>
          ) : (
            fechas.map(fecha => (
              <div key={fecha}>
                <p style={{
                  fontSize:      11,
                  fontWeight:    600,
                  color:         'var(--color-texto-suave)',
                  fontFamily:    'var(--font-mono)',
                  marginBottom:  7,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {formatDia(fecha)}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {porFecha[fecha].sort().map(hora => {
                    const elegido = slotElegido?.fecha === fecha && slotElegido?.hora === hora
                    return (
                      <button
                        key={hora}
                        onClick={() => setSlotElegido({ fecha, hora })}
                        style={{
                          padding:      '6px 14px',
                          borderRadius: 'var(--radio-sm)',
                          border:       elegido
                            ? '2px solid var(--color-primario)'
                            : '1.5px solid var(--color-borde-medio)',
                          background:   elegido ? 'var(--color-primario-light)' : 'rgba(255,255,255,0.8)',
                          color:        elegido ? 'var(--color-primario)' : 'var(--color-texto-medio)',
                          fontSize:     13,
                          fontWeight:   elegido ? 700 : 400,
                          cursor:       'pointer',
                          fontFamily:   'var(--font-mono)',
                          transition:   'all 0.12s',
                        }}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div style={{
            padding:      '10px 14px',
            background:   'rgba(239,68,68,0.06)',
            border:       '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radio-md)',
            color:        '#dc2626',
            fontSize:     12,
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} className="btn btn--ghost" style={{ flex: 1 }}>Cancelar</button>
          <button
            onClick={() => slotElegido && onConfirmar(slotElegido.fecha, slotElegido.hora)}
            disabled={!slotElegido || cargando}
            className="btn btn--primario"
            style={{
              flex:    2,
              opacity: (!slotElegido || cargando) ? 0.5 : 1,
              cursor:  (!slotElegido || cargando) ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Reprogramando...' : slotElegido ? `Confirmar — ${slotElegido.hora}` : 'Elegí un horario'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDia(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  } catch { return fechaStr }
}

const btnXStyle = {
  background:    'rgba(255,255,255,0.7)',
  border:        '1px solid var(--color-borde-medio)',
  borderRadius:  'var(--radio-sm)',
  width:         32, height: 32,
  cursor:        'pointer',
  color:         'var(--color-texto-suave)',
  fontSize:      14,
  display:       'flex',
  alignItems:    'center',
  justifyContent:'center',
  fontFamily:    'inherit',
  flexShrink:    0,
}