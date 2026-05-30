// src/components/medico/ModalReprogramar.jsx
// Light theme.

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
    <div
      onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 20px 60px rgba(15,23,42,0.15)', animation: 'modalIn 0.2s ease' }}
      >
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 4 }}>
              Reprogramar cita
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {turno?.paciente?.nombre}
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
              Actual: {turno?.fecha} — {turno?.hora}
            </p>
          </div>
          <button onClick={onCerrar} style={btnXStyle}>✕</button>
        </div>

        {/* Slots */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fechas.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '1.5rem 0', background: '#f8fafc', borderRadius: 8 }}>
              No hay horarios disponibles esta semana.
            </p>
          ) : (
            fechas.map(fecha => (
              <div key={fecha}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', fontFamily: 'monospace', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                          padding: '6px 14px', borderRadius: 8,
                          border: elegido ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                          background: elegido ? '#eff6ff' : 'white',
                          color: elegido ? '#1d4ed8' : '#475569',
                          fontSize: 13, fontWeight: elegido ? 700 : 400,
                          cursor: 'pointer', fontFamily: 'monospace',
                          transition: 'all 0.12s',
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
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} style={btnCancelStyle}>Cancelar</button>
          <button
            onClick={() => slotElegido && onConfirmar(slotElegido.fecha, slotElegido.hora)}
            disabled={!slotElegido || cargando}
            style={{ ...btnConfirmStyle, opacity: (!slotElegido || cargando) ? 0.5 : 1, cursor: (!slotElegido || cargando) ? 'not-allowed' : 'pointer' }}
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
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return fechaStr }
}

const btnXStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }
const btnCancelStyle = { flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const btnConfirmStyle = { flex: 2, padding: '10px', borderRadius: 9, border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }