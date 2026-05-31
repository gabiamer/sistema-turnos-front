// src/components/medico/PanelCita.jsx
// Panel lateral deslizable — detalle de cita. Usa clases globales de index.css

import { getEstiloEstado } from '../../utils/mapEstado'

export default function PanelCita({ slot, onCerrar, onConcluir, onReprogramar, onCancelar, cargando }) {
  if (!slot) return null

  const { turno, fecha, hora } = slot
  const estadoStyle = getEstiloEstado(turno.estado)
  const esConcluida  = turno.estado === 'CONCLUIDA'
  const esCancelada  = turno.estado === 'CANCELADO'
  const esGestionable = !esConcluida && !esCancelada

  return (
    <>
      <div
        onClick={onCerrar}
        style={{ position: 'fixed', inset: 0, background: 'rgba(28,53,69,0.3)', zIndex: 200 }}
      />
      <div style={{
        position:      'fixed',
        top:           0, right: 0, bottom: 0,
        width:         '100%', maxWidth: 360,
        background:    'rgba(240,248,252,0.98)',
        backdropFilter:'blur(20px)',
        borderLeft:    '1px solid var(--color-borde-suave)',
        zIndex:        201,
        display:       'flex',
        flexDirection: 'column',
        boxShadow:     '-8px 0 40px rgba(28,53,69,0.12)',
        animation:     'slideIn 0.22s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div style={{
          padding:      '20px',
          borderBottom: '1px solid var(--color-borde-suave)',
          display:      'flex',
          justifyContent:'space-between',
          alignItems:   'center',
          background:   'rgba(255,255,255,0.6)',
        }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Detalle de cita</p>
            <h2 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      17,
              fontWeight:    400,
              color:         'var(--color-texto)',
              margin:        0,
              letterSpacing: '-0.01em',
            }}>
              {turno.paciente?.nombre ?? 'Paciente'}
            </h2>
          </div>
          <button
            onClick={onCerrar}
            style={{
              background:    'rgba(255,255,255,0.7)',
              border:        '1px solid var(--color-borde-medio)',
              borderRadius:  'var(--radio-sm)',
              width:         34, height: 34,
              cursor:        'pointer',
              color:         'var(--color-texto-suave)',
              fontSize:      14,
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              fontFamily:    'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* Info card */}
          <div style={{
            background:   'rgba(255,255,255,0.6)',
            backdropFilter:'blur(8px)',
            borderRadius: 'var(--radio-md)',
            padding:      '14px 16px',
            display:      'flex',
            flexDirection:'column',
            gap:           10,
            border:       '1px solid var(--color-borde-suave)',
          }}>
            <InfoRow label="Paciente" value={turno.paciente?.nombre} />
            <InfoRow label="CI"       value={turno.paciente?.ci} mono />
            <InfoRow label="Fecha"    value={formatearFecha(fecha)} />
            <InfoRow label="Hora"     value={hora} mono />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--color-texto-muted)' }}>Estado</span>
              <span style={{
                fontSize:   11, fontWeight: 700,
                padding:    '3px 10px', borderRadius: 999,
                background: estadoStyle.bg,
                border:     `1px solid ${estadoStyle.border}`,
                color:      estadoStyle.color,
              }}>
                {estadoStyle.label}
              </span>
            </div>
          </div>

          {/* Acciones */}
          {esGestionable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p className="eyebrow">Acciones</p>

              <BtnAccion
                onClick={() => onConcluir(turno.id)}
                disabled={cargando}
                acento="var(--estado-concluida-bg)"
                borderColor="var(--estado-bloqueado-tenue)"
                icono="✓"
                label="Marcar como concluida"
                loading={cargando}
              />
              <BtnAccion
                onClick={() => onReprogramar(slot)}
                disabled={cargando}
                acento="var(--estado-ocupado-bg)"
                borderColor="var(--estado-ocupado-tenue)"
                icono="↗"
                label="Reprogramar"
              />
              <BtnAccion
                onClick={() => onCancelar(slot)}
                disabled={cargando}
                acento="#dc2626"
                borderColor="rgba(239,68,68,0.2)"
                icono="✕"
                label="Cancelar cita"
              />
            </div>
          )}

          {(esConcluida || esCancelada) && (
            <p style={{ fontSize: 13, color: 'var(--color-texto-muted)', textAlign: 'center', padding: '12px 0' }}>
              Esta cita ya no tiene acciones disponibles.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--color-texto-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--color-texto)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontWeight: 500 }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function BtnAccion({ onClick, disabled, acento, borderColor, icono, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:         '100%',
        padding:       '11px 16px',
        borderRadius:  'var(--radio-md)',
        border:        `1.5px solid ${borderColor}`,
        background:    'rgba(255,255,255,0.7)',
        color:         acento,
        fontSize:      13,
        fontWeight:    600,
        cursor:        disabled ? 'not-allowed' : 'pointer',
        opacity:       disabled ? 0.55 : 1,
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        fontFamily:    'inherit',
        textAlign:     'left',
        transition:    'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.95)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.7)' }}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{icono}</span>
      {loading ? 'Procesando...' : label}
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