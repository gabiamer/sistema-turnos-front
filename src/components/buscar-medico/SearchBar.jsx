// src/components/buscar-medico/SearchBar.jsx
import { useState } from 'react'

function SearchBar({ valor, onChange }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        style={{
          position: 'absolute', left: '1.1rem', top: '50%',
          transform: 'translateY(-50%)', width: '16px', height: '16px',
          color: focused ? '#4a7c9e' : '#a8c4d4', transition: 'color 0.2s',
          pointerEvents: 'none', flexShrink: 0,
        }}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" strokeWidth="1.8" />
        <path d="M21 21l-4.35-4.35" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={valor}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Buscar por nombre o especialidad..."
        style={{
          width: '100%',
          padding: '1rem 3rem 1rem 2.8rem',
          borderRadius: '50px',
          border: `1.5px solid ${focused ? '#7ab0c8' : 'rgba(255,255,255,0.8)'}`,
          fontSize: '0.9rem',
          color: '#2c4a5a',
          backgroundColor: 'rgba(255,255,255,0.92)',
          outline: 'none',
          transition: 'all 0.25s',
          boxShadow: focused
            ? '0 4px 24px rgba(74,124,158,0.18)'
            : '0 2px 12px rgba(74,124,158,0.08)',
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          letterSpacing: '0.01em',
          boxSizing: 'border-box',
        }}
      />
      {valor && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '1rem', top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(74,124,158,0.12)', border: 'none',
            borderRadius: '50%', width: '24px', height: '24px',
            cursor: 'pointer', color: '#4a7c9e', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      )}
    </div>
  )
}

export default SearchBar