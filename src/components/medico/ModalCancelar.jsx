// src/components/medico/ModalCancelar.jsx
// Light theme.

import { useState } from 'react'

const CANALES = [
  { id: 'WHATSAPP', label: 'WhatsApp', icono: '💬' },
  { id: 'SMS',      label: 'SMS',      icono: '📱' },
  { id: 'EMAIL',    label: 'Email',    icono: '✉️' },
]

export default function ModalCancelar({ turno, onConfirmar, onCerrar, cargando, error }) {
  const [motivo, setMotivo]         = useState('')
  const [canales, setCanales]       = useState(['WHATSAPP'])
  const [validacion, setValidacion] = useState('')

  function toggleCanal(id) {
    setCanales(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function handleConfirmar() {
    if (!motivo.trim()) { setValidacion('El motivo es requerido.'); return }
    if (canales.length === 0) { setValidacion('Seleccioná al menos un canal.'); return }
    setValidacion('')
    onConfirmar(motivo.trim(), canales)
  }

  return (
    <div
      onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', border: '1px solid #fecaca', borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 20px 60px rgba(15,23,42,0.15)', animation: 'modalIn 0.2s ease' }}
      >
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:none} }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 4 }}>
              Cancelar cita
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {turno?.paciente?.nombre}
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
              {turno?.fecha} — {turno?.hora}
            </p>
          </div>
          <button onClick={onCerrar} style={btnXStyle}>✕</button>
        </div>

        {/* Motivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Motivo de cancelación <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setValidacion('') }}
            placeholder="Describe el motivo de la cancelación..."
            rows={3}
            style={{
              width: '100%', padding: '10px 12px',
              background: '#f8fafc', border: `1.5px solid ${validacion && !motivo.trim() ? '#fca5a5' : '#e2e8f0'}`,
              borderRadius: 9, color: '#1e293b', fontSize: 13,
              fontFamily: 'inherit', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#fca5a5'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Canales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
            Notificar vía <span style={{ color: '#dc2626' }}>*</span>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {CANALES.map(c => {
              const activo = canales.includes(c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCanal(c.id)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9,
                    border: activo ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
                    background: activo ? '#fef2f2' : 'white',
                    color: activo ? '#dc2626' : '#64748b',
                    fontSize: 12, fontWeight: activo ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.icono}</span>
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview log */}
        {motivo.trim() && canales.length > 0 && (
          <div style={{ padding: '10px 13px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Preview log simulado
            </p>
            {canales.map(c => (
              <p key={c} style={{ fontSize: 10, color: '#15803d', fontFamily: 'monospace', lineHeight: 1.6 }}>
                [NOTIF][{c}] → {turno?.paciente?.nombre} · {motivo.trim().slice(0, 45)}{motivo.length > 45 ? '...' : ''}
              </p>
            ))}
          </div>
        )}

        {/* Error/validación */}
        {(validacion || error) && (
          <div style={{ padding: '9px 13px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12 }}>
            ⚠ {validacion || error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} style={btnCancelStyle}>Volver</button>
          <button
            onClick={handleConfirmar}
            disabled={cargando}
            style={{ ...btnConfirmStyle, opacity: cargando ? 0.6 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
          >
            {cargando ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  )
}

const btnXStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }
const btnCancelStyle = { flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const btnConfirmStyle = { flex: 2, padding: '10px', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }