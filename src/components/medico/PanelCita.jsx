// src/components/medico/PanelCita.jsx
// Panel lateral deslizable — detalle de cita. Editorial minimal theme.

import { getEstiloEstado } from '../../utils/mapEstado'

const FONT = "'DM Sans', sans-serif"

export default function PanelCita({ slot, onCerrar, onConcluir, onReprogramar, onCancelar, cargando }) {
  if (!slot) return null

  const { turno, fecha, hora } = slot
  const estadoStyle = getEstiloEstado(turno.estado)
  const esConcluida  = turno.estado === 'CONCLUIDA'
  const esCancelada  = turno.estado === 'CANCELADO'
  const esGestionable = !esConcluida && !esCancelada

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
        .pc-action-btn { transition: background 0.15s, border-color 0.15s !important; }
        .pc-action-btn:hover:not(:disabled) { filter: brightness(0.97); }
        .pc-close-btn:hover { background: #edf3f8 !important; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8, 24, 48, 0.22)',
          backdropFilter: 'blur(2px)',
          zIndex: 200,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 368,
        background: '#ffffff',
        borderLeft: '1px solid #dce8f4',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-12px 0 60px rgba(8,24,48,0.09)',
        animation: 'slideIn 0.26s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: FONT,
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #edf3f8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: '#f8fbfe',
        }}>
          <div>
            <p style={{
              fontSize: 10.5,
              fontWeight: 500,
              color: '#7a9cb8',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 8,
              fontFamily: FONT,
            }}>
              Detalle de cita
            </p>
            <h2 style={{
              fontSize: 19,
              fontWeight: 500,
              color: '#0d1f33',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontFamily: FONT,
            }}>
              {turno.paciente?.nombre ?? 'Paciente'}
            </h2>
          </div>
          <button
            onClick={onCerrar}
            className="pc-close-btn"
            style={{
              background: 'transparent',
              border: '1px solid #dce8f4',
              borderRadius: 8,
              width: 34, height: 34,
              cursor: 'pointer',
              color: '#7a94aa',
              fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            aria-label="Cerrar panel"
          >
            <i className="ti ti-x" style={{ fontSize: 15 }} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{
          flex: 1,
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
        }}>

          {/* Card info */}
          <div style={{
            background: '#f5f9fc',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            border: '1px solid #e8f0f8',
          }}>
            <InfoRow label="Paciente" value={turno.paciente?.nombre} />
            <InfoRow label="CI" value={turno.paciente?.ci} mono />
            <InfoRow label="Fecha" value={formatearFecha(fecha)} />
            <InfoRow label="Hora" value={hora} mono />

            {/* Estado badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: 12,
                color: '#6a8ca0',
                fontFamily: FONT,
                fontWeight: 400,
              }}>Estado</span>
              <EstadoBadge estadoStyle={estadoStyle} />
            </div>
          </div>

          {/* Acciones */}
          {esGestionable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{
                fontSize: 10.5,
                fontWeight: 500,
                color: '#7a9cb8',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontFamily: FONT,
                marginBottom: 2,
              }}>
                Acciones
              </p>

              <AccionBtn
                onClick={() => onConcluir(turno.id)}
                disabled={cargando}
                loading={cargando}
                icono="ti-circle-check"
                label="Marcar como concluida"
                color="#3a2a7a"
                accent="#7c5ac4"
                bg="#f8f5fe"
                border="#d8c8f8"
              />
              <AccionBtn
                onClick={() => onReprogramar(slot)}
                disabled={cargando}
                icono="ti-calendar-event"
                label="Reprogramar cita"
                color="#1a4a7a"
                accent="#3a88d8"
                bg="#f0f7fd"
                border="#b8d4f0"
              />
              <AccionBtn
                onClick={() => onCancelar(slot)}
                disabled={cargando}
                icono="ti-calendar-x"
                label="Cancelar cita"
                color="#7a1a1a"
                accent="#c04040"
                bg="#fff5f5"
                border="#f0c0c0"
              />
            </div>
          )}

          {(esConcluida || esCancelada) && (
            <div style={{
              padding: '16px 20px',
              background: '#f5f9fc',
              borderRadius: 10,
              border: '1px solid #e8f0f8',
              textAlign: 'center',
            }}>
              <i
                className={esConcluida ? 'ti ti-circle-check' : 'ti ti-calendar-x'}
                style={{ fontSize: 22, color: '#aac4d8', display: 'block', marginBottom: 8 }}
                aria-hidden="true"
              />
              <p style={{
                fontSize: 13,
                color: '#8fa8bf',
                fontWeight: 300,
                fontFamily: FONT,
                lineHeight: 1.5,
              }}>
                Esta cita ya no tiene<br />acciones disponibles.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{
        fontSize: 12,
        color: '#6a8ca0',
        fontFamily: FONT,
        fontWeight: 400,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        color: '#0d1f33',
        fontFamily: mono ? "'DM Mono', 'Courier New', monospace" : FONT,
        fontWeight: mono ? 400 : 400,
        textAlign: 'right',
        letterSpacing: mono ? '0.02em' : 0,
      }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function EstadoBadge({ estadoStyle }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '4px 12px',
      borderRadius: 999,
      background: estadoStyle.bg,
      border: `1px solid ${estadoStyle.border}`,
      color: estadoStyle.color,
      letterSpacing: '0.04em',
      fontFamily: FONT,
    }}>
      {estadoStyle.label}
    </span>
  )
}

function AccionBtn({ onClick, disabled, loading, icono, label, color, accent, bg, border }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pc-action-btn"
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: bg,
        color: color,
        fontSize: 13.5,
        fontWeight: 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONT,
        textAlign: 'left',
        letterSpacing: '0.01em',
      }}
    >
      <i
        className={`ti ${icono}`}
        style={{ fontSize: 16, color: accent, flexShrink: 0 }}
        aria-hidden="true"
      />
      {loading ? 'Procesando…' : label}
    </button>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return fechaStr }
}