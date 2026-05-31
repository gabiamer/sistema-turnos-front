// src/components/medico/ModalCancelar.jsx
// Editorial minimal theme — soft blue-pastel aesthetic

import { useState } from 'react'

const CANALES = [
  { id: 'WHATSAPP', label: 'WhatsApp', icono: 'ti-brand-whatsapp' },
  { id: 'SMS',      label: 'SMS',      icono: 'ti-device-mobile' },
  { id: 'EMAIL',    label: 'Email',    icono: 'ti-mail' },
]

const FONT = "'DM Sans', sans-serif"

export default function ModalCancelar({ turno, onConfirmar, onCerrar, cargando, error }) {
  const [motivo, setMotivo]         = useState('')
  const [canales, setCanales]       = useState(['WHATSAPP'])
  const [validacion, setValidacion] = useState('')

  function toggleCanal(id) {
    setCanales(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function handleConfirmar() {
    if (!motivo.trim()) { setValidacion('El motivo es requerido.'); return }
    if (canales.length === 0) { setValidacion('Selecciona al menos un canal.'); return }
    setValidacion('')
    onConfirmar(motivo.trim(), canales)
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.975) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mc-textarea:focus { outline: none; border-color: #a8c8e8 !important; }
        .mc-textarea::placeholder { color: #b0bec5; }
        .mc-btn-canal:hover { background: #eef5fc !important; }
        .mc-btn-close:hover { background: #f0f4f8 !important; }
        .mc-btn-back:hover  { background: #f5f8fb !important; }
        .mc-btn-confirm:hover:not(:disabled) { background: #ffeaea !important; }
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
            maxWidth: 440,
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
                color: '#c04040',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 8,
                fontFamily: FONT,
              }}>
                Cancelar cita
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
                {turno?.fecha} · {turno?.hora}
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="mc-btn-close"
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

          {/* Motivo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: '#4a6680',
              letterSpacing: '0.04em',
              fontFamily: FONT,
            }}>
              Motivo de cancelación <span style={{ color: '#c04040' }}>*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setValidacion('') }}
              placeholder="Describe el motivo de la cancelación..."
              rows={3}
              className="mc-textarea"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#f5f9fc',
                border: `1px solid ${validacion && !motivo.trim() ? '#f0a0a0' : '#dce8f4'}`,
                borderRadius: 10,
                color: '#0d1f33',
                fontSize: 13.5,
                fontFamily: FONT,
                fontWeight: 300,
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                transition: 'border-color 0.15s',
              }}
            />
          </div>

          {/* Canales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: '#4a6680',
              letterSpacing: '0.04em',
              fontFamily: FONT,
            }}>
              Notificar al paciente vía <span style={{ color: '#c04040' }}>*</span>
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {CANALES.map(c => {
                const activo = canales.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCanal(c.id)}
                    className="mc-btn-canal"
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: activo ? '1.5px solid #9ec5e8' : '1px solid #dce8f4',
                      background: activo ? '#eef6fd' : '#f8fbfd',
                      color: activo ? '#1a5a8c' : '#6a8ca0',
                      fontSize: 12.5,
                      fontWeight: activo ? 500 : 400,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <i
                      className={`ti ${c.icono}`}
                      style={{ fontSize: 20, color: activo ? '#2a7cc4' : '#8faec0' }}
                      aria-hidden="true"
                    />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview log */}
          {motivo.trim() && canales.length > 0 && (
            <div style={{
              padding: '12px 16px',
              background: '#f0f9f4',
              border: '1px solid #c4e8d0',
              borderRadius: 10,
            }}>
              <p style={{
                fontSize: 10,
                fontWeight: 500,
                color: '#2a7a50',
                fontFamily: "'DM Mono', 'Courier New', monospace",
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}>
                Preview · Notificación
              </p>
              {canales.map(c => (
                <p key={c} style={{
                  fontSize: 11.5,
                  color: '#2a6040',
                  fontFamily: "'DM Mono', 'Courier New', monospace",
                  lineHeight: 1.7,
                }}>
                  [{c}] → {turno?.paciente?.nombre} · {motivo.trim().slice(0, 48)}{motivo.length > 48 ? '…' : ''}
                </p>
              ))}
            </div>
          )}

          {/* Error / validación */}
          {(validacion || error) && (
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
              {validacion || error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
            <button
              onClick={onCerrar}
              className="mc-btn-back"
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
              Volver
            </button>
            <button
              onClick={handleConfirmar}
              disabled={cargando}
              className="mc-btn-confirm"
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: 10,
                border: '1px solid #f0b8b8',
                background: '#fff0f0',
                color: '#b83030',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.6 : 1,
                fontFamily: FONT,
                letterSpacing: '0.01em',
                transition: 'all 0.15s',
              }}
            >
              {cargando ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}