// src/components/medico/ModalReprogramar.jsx
// Editorial minimal theme — soft blue-pastel aesthetic

import { useState } from 'react'

const FONT = "'DM Sans', sans-serif"

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
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.975) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mr-slot:hover { background: #eef6fd !important; border-color: #9ec5e8 !important; color: #1a5a8c !important; }
        .mr-btn-close:hover { background: #f0f4f8 !important; }
        .mr-btn-back:hover  { background: #f5f8fb !important; }
        .mr-btn-confirm:hover:not(:disabled) { background: #e6f0fb !important; }
        .mr-slots-scroll::-webkit-scrollbar { width: 4px; }
        .mr-slots-scroll::-webkit-scrollbar-track { background: transparent; }
        .mr-slots-scroll::-webkit-scrollbar-thumb { background: #c8daea; border-radius: 4px; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8, 24, 48, 0.28)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500, padding: 20,
          fontFamily: FONT,
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#ffffff',
            border: '1px solid #dce8f4',
            borderRadius: 18,
            padding: '32px 36px',
            width: '100%',
            maxWidth: 460,
            maxHeight: '82vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            boxShadow: '0 24px 80px rgba(8,24,48,0.10), 0 4px 16px rgba(8,24,48,0.06)',
            animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{
                fontSize: 10.5,
                fontWeight: 500,
                color: '#2a6aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 8,
                fontFamily: FONT,
              }}>
                Reprogramar cita
              </p>
              <h3 style={{
                fontSize: 20,
                fontWeight: 500,
                color: '#0d1f33',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                fontFamily: FONT,
              }}>
                {turno?.paciente?.nombre}
              </h3>
              <p style={{
                fontSize: 13,
                color: '#8fa8bf',
                marginTop: 6,
                fontWeight: 300,
                letterSpacing: '0.01em',
                fontFamily: FONT,
              }}>
                Actual · {turno?.fecha} · {turno?.hora}
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="mr-btn-close"
              style={{
                background: 'transparent',
                border: '1px solid #dce8f4',
                borderRadius: 8,
                width: 34, height: 34,
                cursor: 'pointer',
                color: '#7a94aa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              aria-label="Cerrar"
            >
              <i className="ti ti-x" style={{ fontSize: 15 }} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#edf3f8', margin: '-8px 0' }} />

          {/* Slots con scroll */}
          <div
            className="mr-slots-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              paddingRight: 4,
            }}
          >
            {fechas.length === 0 ? (
              <div style={{
                padding: '28px 20px',
                background: '#f5f9fc',
                borderRadius: 12,
                border: '1px solid #e8f0f8',
                textAlign: 'center',
              }}>
                <i className="ti ti-calendar-off" style={{ fontSize: 28, color: '#aac4d8', display: 'block', marginBottom: 10 }} aria-hidden="true" />
                <p style={{ color: '#8fa8bf', fontSize: 13.5, fontWeight: 300, fontFamily: FONT }}>
                  No hay horarios disponibles esta semana
                </p>
              </div>
            ) : (
              fechas.map(fecha => (
                <div key={fecha}>
                  <p style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: '#6a8ca0',
                    fontFamily: FONT,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}>
                    {formatDia(fecha)}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {porFecha[fecha].sort().map(hora => {
                      const elegido = slotElegido?.fecha === fecha && slotElegido?.hora === hora
                      return (
                        <button
                          key={hora}
                          onClick={() => setSlotElegido({ fecha, hora })}
                          className={elegido ? '' : 'mr-slot'}
                          style={{
                            padding: '7px 16px',
                            borderRadius: 8,
                            border: elegido ? '1.5px solid #4a96d8' : '1px solid #dce8f4',
                            background: elegido ? '#eef6fd' : '#f8fbfd',
                            color: elegido ? '#1a5a8c' : '#5a7a90',
                            fontSize: 13,
                            fontWeight: elegido ? 500 : 400,
                            cursor: 'pointer',
                            fontFamily: "'DM Mono', 'Courier New', monospace",
                            letterSpacing: '0.03em',
                            transition: 'all 0.15s',
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

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#fff5f5',
              border: '1px solid #f0c0c0',
              borderRadius: 9,
              color: '#a03030',
              fontSize: 12.5,
              fontFamily: FONT,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
            <button
              onClick={onCerrar}
              className="mr-btn-back"
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 10,
                border: '1px solid #dce8f4',
                background: 'transparent',
                color: '#5a7a90',
                fontSize: 13.5,
                fontWeight: 400,
                cursor: 'pointer',
                fontFamily: FONT,
                transition: 'background 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => slotElegido && onConfirmar(slotElegido.fecha, slotElegido.hora)}
              disabled={!slotElegido || cargando}
              className="mr-btn-confirm"
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: 10,
                border: '1px solid #b8d4f0',
                background: '#f0f7fd',
                color: '#1a4a7a',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: (!slotElegido || cargando) ? 'not-allowed' : 'pointer',
                opacity: (!slotElegido || cargando) ? 0.5 : 1,
                fontFamily: FONT,
                letterSpacing: '0.01em',
                transition: 'all 0.15s',
              }}
            >
              {cargando
                ? 'Reprogramando…'
                : slotElegido
                  ? `Confirmar · ${slotElegido.hora}`
                  : 'Elige un horario'}
            </button>
          </div>
        </div>
      </div>
    </>
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