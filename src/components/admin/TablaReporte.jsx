// src/components/admin/TablaReporte.jsx
import { useState } from 'react'
import { adminService } from '../../services/adminService'

const PAGE_SIZE = 20

function TablaReporte({ headers, rows, tipo, periodo, cargando }) {
  const [pagina, setPagina] = useState(0)
  const [exportando, setExportando] = useState(false)

  const totalPaginas = Math.ceil((rows?.length ?? 0) / PAGE_SIZE)
  const filasPagina  = rows?.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE) ?? []

  const handleExportar = async () => {
    if (!tipo || !periodo?.inicio || !periodo?.fin) return
    setExportando(true)
    try {
      await adminService.exportarCSV(tipo, periodo.inicio, periodo.fin)
    } catch {
      alert('Error al exportar el CSV')
    } finally {
      setExportando(false)
    }
  }

  if (cargando) {
    return <p style={{ color: '#6b7280', padding: '1rem' }}>Cargando reporte...</p>
  }

  if (!rows || rows.length === 0) {
    return <p style={{ color: '#6b7280', padding: '1rem' }}>Sin datos para el período seleccionado.</p>
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {headers.map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filasPagina.map((fila, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                {Object.values(fila).map((val, j) => (
                  <td key={j} style={tdStyle}>{val ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            disabled={pagina === 0}
            style={btnStyle(pagina === 0)}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', alignSelf: 'center' }}>
            Pág {pagina + 1} / {totalPaginas}
          </span>
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
            style={btnStyle(pagina >= totalPaginas - 1)}
          >
            Siguiente →
          </button>
        </div>
        <button onClick={handleExportar} disabled={exportando} style={exportBtnStyle}>
          {exportando ? 'Exportando...' : '⬇ Exportar CSV'}
        </button>
      </div>
    </div>
  )
}

const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }
const tdStyle = { padding: '8px 12px', color: '#4b5563' }
const btnStyle = disabled => ({
  padding: '4px 10px', borderRadius: '4px', border: '1px solid #d1d5db',
  background: disabled ? '#f9fafb' : 'white', color: disabled ? '#9ca3af' : '#374151',
  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.8rem',
})
const exportBtnStyle = {
  padding: '6px 14px', borderRadius: '6px',
  background: '#2563eb', color: 'white', border: 'none',
  cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
}

export default TablaReporte