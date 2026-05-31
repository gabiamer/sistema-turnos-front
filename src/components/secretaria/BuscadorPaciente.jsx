// src/components/secretaria/BuscadorPaciente.jsx
import { useState, useRef } from 'react'
import { secretariaService } from '../../services/secretariaService'

const FONT = "'DM Sans','Helvetica Neue',sans-serif"
const SERIF = "'DM Serif Display',Georgia,serif"

export default function BuscadorPaciente({ onAgendar, onRegistrar }) {
  const [query, setQuery]           = useState('')
  const [resultados, setResultados] = useState([])
  const [buscado, setBuscado]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const inputRef = useRef(null)

  async function handleBuscar(e) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) { setError('Ingresá al menos 2 caracteres.'); return }
    setError(''); setLoading(true); setBuscado(false); setResultados([])
    try {
      const data = await secretariaService.buscarPaciente(q)
      setResultados(Array.isArray(data) ? data : [])
      setBuscado(true)
    } catch {
      setError('Error al buscar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleLimpiar() {
    setQuery(''); setResultados([]); setBuscado(false); setError('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ width: '100%', fontFamily: FONT }}>
      <style>{`
        .buscador-input:focus { border-color: rgba(58,106,158,0.45) !important; outline: none; background: rgba(255,255,255,0.95) !important; }
        .buscador-input::placeholder { color: #a0b4c8; }
        .buscador-btn-search:hover:not(:disabled) { background: #2e5d96 !important; }
        .buscador-btn-clear:hover { background: rgba(74,106,140,0.08) !important; }
        .buscador-result:hover { background: rgba(255,255,255,0.9) !important; border-color: rgba(74,106,140,0.2) !important; }
        .buscador-btn-agendar:hover { background: #2e5d96 !important; }
        .buscador-btn-registrar:hover { background: rgba(13,122,79,0.1) !important; }
        @keyframes resultsIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .results-list { animation: resultsIn 0.25s ease; }
      `}</style>

      {/* Barra de búsqueda */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '0.6rem', marginBottom: error ? '0.6rem' : '0' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); if (error) setError('') }}
            placeholder="Buscar por CI o nombre…"
            aria-label="Buscar paciente"
            className="buscador-input"
            style={{
              width: '100%', padding: '0.65rem 0.9rem 0.65rem 2.4rem',
              borderRadius: 12, border: '1px solid rgba(74,106,140,0.18)',
              fontSize: '0.875rem', background: 'rgba(220,232,240,0.4)',
              color: '#1a2e3f', fontFamily: FONT,
              transition: 'all 0.2s', boxSizing: 'border-box',
            }}
          />
          {/* Lupa icon */}
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: '#8aa4b8', fontSize: '0.9rem', pointerEvents: 'none',
          }}>⌕</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="buscador-btn-search"
          style={{
            padding: '0 1.25rem', borderRadius: 12,
            border: 'none', background: '#3a6a9e',
            color: 'white', fontSize: '0.875rem', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: FONT, whiteSpace: 'nowrap',
            transition: 'background 0.2s', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '…' : 'Buscar'}
        </button>

        {buscado && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="buscador-btn-clear"
            style={{
              padding: '0 0.75rem', borderRadius: 12,
              border: '1px solid rgba(74,106,140,0.18)',
              background: 'transparent', color: '#7a96b0',
              fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: FONT, transition: 'background 0.15s',
            }}
          >✕</button>
        )}
      </form>

      {/* Error */}
      {error && (
        <p role="alert" style={{ color: '#b92222', fontSize: '0.8rem', margin: '0.5rem 0 0', fontWeight: 400 }}>
          ⚠&ensp;{error}
        </p>
      )}

      {/* Sin resultados */}
      {buscado && resultados.length === 0 && !loading && (
        <div className="results-list" style={{
          marginTop: '1rem',
          padding: '1.5rem',
          background: 'rgba(220,232,240,0.35)',
          border: '1px solid rgba(74,106,140,0.12)',
          borderRadius: 14, textAlign: 'center',
        }}>
          <p style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 400, fontStyle: 'italic', color: '#5a7a9a', margin: '0 0 0.3rem' }}>
            Sin resultados
          </p>
          <p style={{ color: '#8aa4b8', fontSize: '0.82rem', margin: '0 0 1rem', fontWeight: 300 }}>
            No se encontró ningún paciente con "<strong style={{ fontWeight: 500 }}>{query}</strong>".
          </p>
          <button
            onClick={onRegistrar}
            className="buscador-btn-registrar"
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 50,
              border: '1px solid rgba(13,122,79,0.25)',
              background: 'transparent', color: '#0d7a4f',
              fontSize: '0.82rem', fontWeight: 500,
              cursor: 'pointer', fontFamily: FONT,
              transition: 'background 0.2s',
            }}
          >
            + Registrar paciente nuevo
          </button>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="results-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem' }}>
          {resultados.map((p, i) => {
            const initials = `${p.nombre?.[0] ?? ''}${p.apellido?.[0] ?? ''}`.toUpperCase()
            return (
              <div
                key={p.id}
                className="buscador-result"
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(74,106,140,0.12)',
                  borderRadius: 13, padding: '0.75rem 0.9rem',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.15s',
                  animation: `resultsIn 0.25s ease ${i * 0.05}s both`,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(58,106,158,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600, color: '#3a6a9e',
                }}>
                  {initials || '?'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: '#1a2e3f', fontSize: '0.875rem', margin: '0 0 0.1rem' }}>
                    {p.nombre} {p.apellido}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#8aa4b8', margin: 0, fontWeight: 300 }}>
                    CI: {p.ci}{p.telefono ? ` · ${p.telefono}` : ''}
                  </p>
                </div>

                {/* Acción */}
                <button
                  onClick={() => onAgendar(p)}
                  aria-label={`Agendar turno para ${p.nombre} ${p.apellido}`}
                  className="buscador-btn-agendar"
                  style={{
                    padding: '0.38rem 0.9rem', borderRadius: 8,
                    border: 'none', background: '#3a6a9e',
                    color: 'white', fontSize: '0.78rem', fontWeight: 500,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: FONT, transition: 'background 0.15s',
                  }}
                >
                  Agendar →
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}