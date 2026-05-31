// src/components/admin/SelectorPeriodo.jsx
import { useState, useEffect } from 'react'

const hoy = () => new Date().toISOString().split('T')[0]
const primeroDeMes = () => {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

function SelectorPeriodo({ onChange }) {
  const [inicio, setInicio] = useState(primeroDeMes())
  const [fin, setFin]       = useState(hoy())
  const [error, setError]   = useState('')

  useEffect(() => {
    const diffDias = Math.round(
      (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24)
    )
    if (fin < inicio) {
      setError('La fecha fin debe ser posterior al inicio')
      return
    }
    if (diffDias > 90) {
      setError('El rango no puede superar los 90 días')
      return
    }
    setError('')
    onChange({ inicio, fin })
  }, [inicio, fin])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Desde</label>
        <input
          type="date"
          value={inicio}
          max={fin}
          onChange={e => setInicio(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Hasta</label>
        <input
          type="date"
          value={fin}
          min={inicio}
          onChange={e => setFin(e.target.value)}
          style={inputStyle}
        />
      </div>
      {error && (
        <span style={{ color: '#ef4444', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  )
}

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '0.875rem',
}

export default SelectorPeriodo