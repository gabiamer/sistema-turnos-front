// src/components/medico/Toast.jsx
// Editorial minimal theme — soft blue-pastel aesthetic

import { useEffect } from 'react'

const ESTILOS = {
  ok: {
    bg: 'rgba(240, 248, 255, 0.96)',
    border: '#b8d8f0',
    color: '#1a4a6e',
    accent: '#3b82c4',
    icono: 'ti-circle-check',
  },
  error: {
    bg: 'rgba(255, 245, 245, 0.96)',
    border: '#f0b8b8',
    color: '#6e1a1a',
    accent: '#c43b3b',
    icono: 'ti-alert-circle',
  },
  warn: {
    bg: 'rgba(255, 252, 240, 0.96)',
    border: '#e8d898',
    color: '#5c4a10',
    accent: '#b8960a',
    icono: 'ti-alert-triangle',
  },
}

export default function Toast({ mensaje, tipo = 'ok', onCerrar }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 4500)
    return () => clearTimeout(t)
  }, [onCerrar])

  const e = ESTILOS[tipo] ?? ESTILOS.ok

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-close:hover { opacity: 1 !important; }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 32,
        right: 28,
        zIndex: 9999,
        background: e.bg,
        border: `1px solid ${e.border}`,
        borderLeft: `3px solid ${e.accent}`,
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(12px)',
        maxWidth: 360,
        animation: 'toastSlide 0.25s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <i
          className={`ti ${e.icono}`}
          style={{ fontSize: 18, color: e.accent, flexShrink: 0 }}
          aria-hidden="true"
        />
        <span style={{
          fontSize: 13.5,
          color: e.color,
          fontWeight: 400,
          lineHeight: 1.45,
          letterSpacing: '0.01em',
        }}>
          {mensaje}
        </span>
        <button
          onClick={onCerrar}
          className="toast-close"
          style={{
            background: 'none',
            border: 'none',
            color: e.color,
            cursor: 'pointer',
            fontSize: 13,
            padding: 0,
            marginLeft: 'auto',
            opacity: 0.45,
            fontFamily: 'inherit',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          aria-label="Cerrar notificación"
        >
          <i className="ti ti-x" style={{ fontSize: 14 }} />
        </button>
      </div>
    </>
  )
}