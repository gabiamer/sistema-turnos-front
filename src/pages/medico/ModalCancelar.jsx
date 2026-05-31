// src/components/medico/ModalCancelar.jsx
// Light theme — usa clases globales de index.css

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
    if (!motivo.trim())      { setValidacion('El motivo es requerido.'); return }
    if (canales.length === 0) { setValidacion('Seleccioná al menos un canal.'); return }
    setValidacion('')
    onConfirmar(motivo.trim(), canales)
  }

  return (
    <div onClick={onCerrar} className="modal-overlay">
      <div
        onClick={e => e.stopPropagation()}
        className="modal-contenido"
        style={{ maxWidth: 420, gap: 18, display: 'flex', flexDirection: 'column', borderColor: 'rgba(239,68,68,0.2)' }}
      >

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ color: '#dc2626', marginBottom: 4 }}>Cancelar cita</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--color-texto)', margin: 0 }}>
              {turno?.paciente?.nombre}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-texto-muted)', marginTop: 3 }}>
              {turno?.fecha} — {turno?.hora}
            </p>
          </div>
          <button onClick={onCerrar} style={btnXStyle}>✕</button>
        </div>

        {/* Motivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-texto-suave)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Motivo <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setValidacion('') }}
            placeholder="Describe el motivo de la cancelación..."
            rows={3}
            className="input-base"
            style={{
              resize: 'vertical',
              borderColor: validacion && !motivo.trim() ? 'rgba(239,68,68,0.4)' : undefined,
            }}
          />
        </div>

        {/* Canales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-texto-suave)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                    flex:           1,
                    padding:        '10px 8px',
                    borderRadius:   'var(--radio-md)',
                    border:         activo ? '1.5px solid rgba(239,68,68,0.35)' : '1.5px solid var(--color-borde-medio)',
                    background:     activo ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.7)',
                    color:          activo ? '#dc2626' : 'var(--color-texto-suave)',
                    fontSize:       12,
                    fontWeight:     activo ? 700 : 400,
                    cursor:         'pointer',
                    fontFamily:     'var(--font-body)',
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    gap:            3,
                    transition:     'all 0.12s',
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
          <div style={{
            padding:      '10px 13px',
            background:   'rgba(34,197,94,0.06)',
            border:       '1px solid rgba(34,197,94,0.2)',
            borderRadius: 'var(--radio-md)',
          }}>
            <p className="eyebrow" style={{ color: '#16a34a', marginBottom: 4 }}>Preview log simulado</p>
            {canales.map(c => (
              <p key={c} style={{ fontSize: 10, color: '#15803d', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                [NOTIF][{c}] → {turno?.paciente?.nombre} · {motivo.trim().slice(0, 45)}{motivo.length > 45 ? '...' : ''}
              </p>
            ))}
          </div>
        )}

        {/* Error/validación */}
        {(validacion || error) && (
          <div style={{
            padding:      '9px 13px',
            background:   'rgba(239,68,68,0.06)',
            border:       '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radio-md)',
            color:        '#dc2626',
            fontSize:     12,
          }}>
            ⚠ {validacion || error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} className="btn btn--ghost" style={{ flex: 1 }}>Volver</button>
          <button
            onClick={handleConfirmar}
            disabled={cargando}
            className="btn btn--danger"
            style={{ flex: 2, opacity: cargando ? 0.6 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
          >
            {cargando ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  )
}

const btnXStyle = {
  background:   'rgba(255,255,255,0.7)',
  border:       '1px solid var(--color-borde-medio)',
  borderRadius: 'var(--radio-sm)',
  width:        32, height: 32,
  cursor:       'pointer',
  color:        'var(--color-texto-suave)',
  fontSize:     14,
  display:      'flex',
  alignItems:   'center',
  justifyContent:'center',
  fontFamily:   'inherit',
  flexShrink:   0,
}