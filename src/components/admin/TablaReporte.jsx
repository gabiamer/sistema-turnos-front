// src/components/admin/TablaReporte.jsx
import { useState } from 'react'

const FONT = "'DM Sans','Helvetica Neue',sans-serif"
const PAGE_SIZE = 20

function TablaReporte({ headers, rows, cargando, onExportar }) {
  const [pagina, setPagina]       = useState(0)
  const [exportando, setExportando] = useState(false)

  const totalPaginas = Math.ceil((rows?.length ?? 0) / PAGE_SIZE)
  const filasPagina  = rows?.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE) ?? []

  const handleExportar = async () => {
    if (!onExportar) return
    setExportando(true)
    try {
      await onExportar()
    } catch {
      alert('Error al exportar el CSV')
    } finally {
      setExportando(false)
    }
  }

  if (cargando) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'2rem 0', color:'#7fa3b8', fontSize:'0.85rem', fontFamily: FONT }}>
        <span style={{ display:'inline-block', width:14, height:14, borderRadius:'50%', border:'2px solid #4a7c9e', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />
        Cargando reporte…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <p style={{ color:'#7fa3b8', padding:'1.5rem 0', textAlign:'center', fontWeight:300, fontSize:'0.875rem', fontFamily: FONT, margin:0 }}>
        Sin datos para el período seleccionado.
      </p>
    )
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid rgba(74,124,158,0.12)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.845rem' }}>
          <thead>
            <tr style={{ background:'rgba(74,124,158,0.06)' }}>
              {headers.map(h => (
                <th key={h} style={{
                  padding:'0.75rem 1rem',
                  textAlign:'left',
                  fontWeight:500,
                  color:'#4a7c9e',
                  fontSize:'0.7rem',
                  letterSpacing:'0.1em',
                  textTransform:'uppercase',
                  whiteSpace:'nowrap',
                  borderBottom:'1px solid rgba(74,124,158,0.12)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filasPagina.map((fila, i) => (
              <tr
                key={i}
                className="reporte-row"
                style={{
                  borderBottom: i < filasPagina.length - 1
                    ? '1px solid rgba(74,124,158,0.07)'
                    : 'none',
                }}
              >
                {Object.values(fila).map((val, j) => (
                  <td key={j} style={{
                    padding:'0.75rem 1rem',
                    color: j === 0 ? '#1c3545' : '#4a7c9e',
                    fontWeight: j === 0 ? 500 : 300,
                    whiteSpace:'nowrap',
                  }}>
                    {val ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer tabla */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
        {/* Paginación */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <PagBtn onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0} label="←" />
          <span style={{ fontSize:'0.78rem', color:'#7fa3b8', padding:'0 0.25rem' }}>
            {pagina + 1} / {totalPaginas}
          </span>
          <PagBtn onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina >= totalPaginas - 1} label="→" />
        </div>

        {/* Exportar */}
        <button
          onClick={handleExportar}
          disabled={exportando}
          style={{
            padding:'0.45rem 1rem',
            borderRadius:50,
            border:'1.5px solid rgba(74,124,158,0.3)',
            background:'transparent',
            color:'#4a7c9e',
            fontSize:'0.78rem', fontWeight:500, cursor: exportando ? 'not-allowed' : 'pointer',
            fontFamily: FONT, transition:'all 0.2s',
            opacity: exportando ? 0.6 : 1,
            display:'flex', alignItems:'center', gap:'0.35rem',
          }}
          onMouseEnter={e => { if (!exportando) { e.currentTarget.style.background='rgba(74,124,158,0.08)'; e.currentTarget.style.borderColor='#4a7c9e' } }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(74,124,158,0.3)' }}
        >
          ↓ {exportando ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>
    </div>
  )
}

function PagBtn({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:30, height:30, borderRadius:'50%',
        border:'1.5px solid rgba(74,124,158,0.2)',
        background: disabled ? 'transparent' : 'rgba(255,255,255,0.6)',
        color: disabled ? '#b0c8d4' : '#4a7c9e',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily: "'DM Sans',sans-serif",
        transition:'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background='rgba(74,124,158,0.1)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background='rgba(255,255,255,0.6)' }}
    >
      {label}
    </button>
  )
}

export default TablaReporte