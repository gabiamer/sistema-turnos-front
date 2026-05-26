// src/components/formulario/CampoInput.jsx
// Componente reutilizable para ambos FormularioPaciente
import { useState } from 'react'

function CampoInput({ label, name, value, onChange, placeholder, type = 'text', error, required }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label
        htmlFor={name}
        style={{
          fontSize: '0.72rem',
          fontWeight: '500',
          color: '#4a7c9e',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}{required && <span style={{ color: '#c9a96e', marginLeft: '0.2rem' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: `1.5px solid ${error ? 'rgba(220,38,38,0.4)' : focused ? '#7ab0c8' : 'rgba(74,124,158,0.2)'}`,
          fontSize: '0.9rem',
          color: '#1c3545',
          outline: 'none',
          backgroundColor: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          boxShadow: focused
            ? '0 4px 16px rgba(74,124,158,0.12)'
            : error ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span style={{
          fontSize: '0.75rem',
          color: '#dc2626',
          fontFamily: "'DM Sans', sans-serif",
          paddingLeft: '0.25rem',
        }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default CampoInput