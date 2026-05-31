// src/components/medico/Spinner.jsx

const FONT = "'DM Sans', sans-serif"

export function Spinner({ label = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7a9cb8', fontSize: 13, fontFamily: FONT, padding: '2rem 0' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #4a7c9e', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {label}
    </div>
  )
}

export function BannerError({ mensaje, onReintentar }) {
  return (
    <div style={{ padding: '14px 18px', background: '#fff5f5', border: '1px solid #f0c0c0', borderRadius: 10, color: '#a03030', fontSize: 13, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>{mensaje}</span>
      {onReintentar && (
        <button onClick={onReintentar} style={{ background: 'none', border: 'none', color: '#a03030', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: FONT }}>
          Reintentar
        </button>
      )}
    </div>
  )
}