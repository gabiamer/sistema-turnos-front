// src/components/secretaria/BuscadorPaciente.jsx — Luciana S5
// GET /api/secretaria/pacientes?q=
// Props: onAgendar(paciente) → abre ModalAgendarSecretaria de Adri
//        onRegistrar()       → abre FormularioPaciente existente

import { useState, useRef } from 'react'
import { secretariaService } from '../../services/secretariaService'

export default function BuscadorPaciente({ onAgendar, onRegistrar }) {
  const [query, setQuery]         = useState('')
  const [resultados, setResultados] = useState([])
  const [buscado, setBuscado]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
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
    <div style={{ width: '100%', maxWidth: 560 }}>
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por CI o nombre…"
          aria-label="Buscar paciente"
          style={{
            flex: 1, padding: '0.6rem 0.9rem',
            borderRadius: '8px', border: '1px solid #cbd5e1',
            fontSize: '0.9rem', outline: 'none',
          }}
        />
        <button
          type="submit" disabled={loading}
          style={{
            padding: '0.6rem 1.1rem', borderRadius: '8px',
            border: 'none', backgroundColor: '#2563eb',
            color: 'white', fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        {buscado && (
          <button
            type="button" onClick={handleLimpiar}
            style={{
              padding: '0.6rem 0.8rem', borderRadius: '8px',
              border: '1px solid #e2e8f0', backgroundColor: 'white',
              color: '#64748b', fontSize: '0.875rem', cursor: 'pointer',
            }}
          >✕</button>
        )}
      </form>

      {error && (
        <p role="alert" style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          ⚠ {error}
        </p>
      )}

      {buscado && resultados.length === 0 && !loading && (
        <div style={{
          padding: '1.25rem', backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            No se encontró ningún paciente con "<strong>{query}</strong>".
          </p>
          <button
            onClick={onRegistrar}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '8px',
              border: 'none', backgroundColor: '#16a34a',
              color: 'white', fontSize: '0.875rem',
              cursor: 'pointer', fontWeight: '600',
            }}
          >
            + Registrar paciente nuevo
          </button>
        </div>
      )}

      {resultados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {resultados.map(p => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'white', border: '1px solid #e2e8f0',
                borderRadius: '10px', padding: '0.9rem 1.1rem',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '1rem',
              }}
            >
              <div>
                <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.2rem' }}>
                  {p.nombre} {p.apellido}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  CI: {p.ci} · {p.telefono ?? '—'}
                </p>
              </div>
              <button
                onClick={() => onAgendar(p)}
                aria-label={`Agendar turno para ${p.nombre} ${p.apellido}`}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: '7px',
                  border: 'none', backgroundColor: '#2563eb',
                  color: 'white', fontSize: '0.8rem',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Agendar →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}