// src/components/medico/PanelCita.jsx
// Panel lateral deslizable — detalle de cita. Light theme.

import { getEstiloEstado } from '../../utils/mapEstado'

export default function PanelCita({ slot, onCerrar, onConcluir, onReprogramar, onCancelar, cargando }) {
  if (!slot) return null

  const { turno, fecha, hora } = slot
  const estadoStyle = getEstiloEstado(turno.estado)
  const esConcluida = turno.estado === 'CONCLUIDA'
  const esCancelada = turno.estado === 'CANCELADO'
  const esGestionable = !esConcluida && !esCancelada

  return (
    <>
      <div
        onClick={onCerrar}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', zIndex: 200 }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 360,
        background: 'white',
        borderLeft: '1px solid #e2e8f0',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(15,23,42,0.12)',
        animation: 'slideIn 0.22s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'monospace' }}>
              Detalle de cita
            </p>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {turno.paciente?.nombre ?? 'Paciente'}
            </h2>
          </div>
          <button
            onClick={onCerrar}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* Info */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #f1f5f9' }}>
            <InfoRow label="Paciente" value={turno.paciente?.nombre} />
            <InfoRow label="CI" value={turno.paciente?.ci} mono />
            <InfoRow label="Fecha" value={formatearFecha(fecha)} />
            <InfoRow label="Hora" value={hora} mono />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Estado</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: '3px 10px', borderRadius: 999,
                background: estadoStyle.bg,
                border: `1px solid ${estadoStyle.border}`,
                color: estadoStyle.color,
              }}>
                {estadoStyle.label}
              </span>
            </div>
          </div>

          {/* Acciones */}
          {esGestionable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                Acciones
              </p>

              <BtnAccion
                onClick={() => onConcluir(turno.id)}
                disabled={cargando}
                color="#7c3aed"
                bg="white"
                border="#e9d5ff"
                hoverBg="#faf5ff"
                icono="✓"
                label="Marcar como concluida"
                loading={cargando}
              />
              <BtnAccion
                onClick={() => onReprogramar(slot)}
                disabled={cargando}
                color="#2563eb"
                bg="white"
                border="#bfdbfe"
                hoverBg="#eff6ff"
                icono="↗"
                label="Reprogramar"
              />
              <BtnAccion
                onClick={() => onCancelar(slot)}
                disabled={cargando}
                color="#dc2626"
                bg="white"
                border="#fecaca"
                hoverBg="#fef2f2"
                icono="✕"
                label="Cancelar cita"
              />
            </div>
          )}

          {(esConcluida || esCancelada) && (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
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
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 500 }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function BtnAccion({ onClick, disabled, color, bg, border, hoverBg, icono, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '11px 16px', borderRadius: 9,
        border: `1.5px solid ${border}`, background: bg, color,
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'inherit', textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = bg)}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{icono}</span>
      {loading ? 'Procesando...' : label}
    </button>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [a, m, d] = fechaStr.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return fechaStr }
}