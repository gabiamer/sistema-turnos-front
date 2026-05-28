// src/components/medico/Toast.jsx
// Light theme.

import { useEffect } from 'react'

const ESTILOS = {
  ok:    { bg: '#f0fdf4', border: '#86efac', color: '#15803d', icono: '✓' },
  error: { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', icono: '⚠' },
  warn:  { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icono: '!' },
}

export default function Toast({ mensaje, tipo = 'ok', onCerrar }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 4500)
    return () => clearTimeout(t)
  }, [onCerrar])

  const e = ESTILOS[tipo] ?? ESTILOS.ok

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 9999,
      background: e.bg, border: `1.5px solid ${e.border}`,
      borderRadius: 12, padding: '13px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 20px rgba(15,23,42,0.12)',
      maxWidth: 380, animation: 'toastIn 0.2s ease',
    }}>
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }`}</style>
      <span style={{ fontSize: 15, color: e.color, flexShrink: 0 }}>{e.icono}</span>
      <span style={{ fontSize: 13, color: e.color, fontWeight: 500, lineHeight: 1.4 }}>{mensaje}</span>
      <button
        onClick={onCerrar}
        style={{ background: 'none', border: 'none', color: e.color, cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 'auto', opacity: 0.7, fontFamily: 'inherit' }}
      >
        ✕
      </button>
    </div>
  )
}