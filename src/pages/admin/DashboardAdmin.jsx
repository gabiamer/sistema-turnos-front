// src/pages/admin/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import SelectorPeriodo    from '../../components/admin/SelectorPeriodo'
import TablaReporte       from '../../components/admin/TablaReporte'
import GraficoOcupacion  from '../../components/admin/GraficoOcupacion'

const TIPOS_REPORTE = [
  { key: 'ocupacion',     label: 'Ocupación' },
  { key: 'ausentismo',    label: 'Ausentismo' },
  { key: 'especialidades', label: 'Especialidades' },
  { key: 'cancelaciones', label: 'Cancelaciones' },
]

const HEADERS_MAP = {
  ocupacion:      ['Médico', 'Especialidad', 'Total Slots', 'Ocupados', '% Ocupación'],
  ausentismo:     ['ID', 'Fecha', 'Médico', 'Especialidad'],
  especialidades: ['Especialidad', 'Total Turnos'],
  cancelaciones:  ['ID', 'Fecha', 'Especialidad', 'Paciente', 'Motivo'],
}

function KpiCard({ label, valor, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '1rem 1.25rem',
      border: `2px solid ${color}`, flex: '1', minWidth: '120px',
    }}>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: '700', color, margin: '4px 0 0' }}>{valor}</p>
    </div>
  )
}

function DashboardAdmin() {
  const [kpis, setKpis]             = useState(null)
  const [tipoReporte, setTipoReporte] = useState('ocupacion')
  const [periodo, setPeriodo]       = useState(null)
  const [filas, setFilas]           = useState([])
  const [cargandoKpis, setCargandoKpis]     = useState(true)
  const [cargandoReporte, setCargandoReporte] = useState(false)
  const [errorReporte, setErrorReporte]     = useState('')

  // Cargar KPIs de hoy al montar
  useEffect(() => {
    adminService.getKpis()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setCargandoKpis(false))
  }, [])

  // Cargar reporte cuando cambia tipo o período
  const cargarReporte = useCallback(async () => {
    if (!periodo) return
    setCargandoReporte(true)
    setErrorReporte('')
    try {
      const data = await adminService.getReporte(tipoReporte, periodo.inicio, periodo.fin)
      setFilas(normalizarFilas(tipoReporte, data))
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Error al cargar el reporte'
      setErrorReporte(msg)
      setFilas([])
    } finally {
      setCargandoReporte(false)
    }
  }, [tipoReporte, periodo])

  useEffect(() => { cargarReporte() }, [cargarReporte])

  const datosGrafico = tipoReporte === 'ocupacion' && !cargandoReporte
    ? filas.map(f => ({
        nombreMedico: f['Médico'],
        porcentaje:   parseFloat(f['% Ocupación']) || 0,
        ocupados:     parseInt(f['Ocupados'])  || 0,
        totalSlots:   parseInt(f['Total Slots']) || 0,
      }))
    : []

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.25rem' }}>
        📊 Dashboard Administrativo
      </h1>

      {/* KPIs */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={seccionTitle}>KPIs de hoy</h2>
        {cargandoKpis ? (
          <p style={{ color: '#6b7280' }}>Cargando indicadores...</p>
        ) : kpis ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <KpiCard label="Confirmados" valor={kpis.confirmados} color="#2563eb" />
            <KpiCard label="Cancelados"  valor={kpis.cancelados}  color="#ef4444" />
            <KpiCard label="Concluidos"  valor={kpis.concluidos}  color="#16a34a" />
            <KpiCard label="Ausentes"    valor={kpis.ausentes}    color="#f59e0b" />
          </div>
        ) : (
          <p style={{ color: '#ef4444' }}>No se pudieron cargar los indicadores.</p>
        )}
      </section>

      {/* Selector de tipo reporte */}
      <section style={{ marginBottom: '1rem' }}>
        <h2 style={seccionTitle}>Reportes</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {TIPOS_REPORTE.map(t => (
            <button
              key={t.key}
              onClick={() => setTipoReporte(t.key)}
              style={chipStyle(tipoReporte === t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <SelectorPeriodo onChange={setPeriodo} />
      </section>

      {/* Gráfico (solo ocupación) */}
      {tipoReporte === 'ocupacion' && datosGrafico.length > 0 && (
        <section style={{ marginBottom: '1.25rem', background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
            Ocupación por médico
          </h3>
          <GraficoOcupacion datos={datosGrafico} />
        </section>
      )}

      {/* Tabla */}
      <section style={{ background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
          {TIPOS_REPORTE.find(t => t.key === tipoReporte)?.label}
        </h3>
        {errorReporte ? (
          <p style={{ color: '#ef4444' }}>⚠ {errorReporte}</p>
        ) : (
          <TablaReporte
            headers={HEADERS_MAP[tipoReporte]}
            rows={filas}
            tipo={tipoReporte}
            periodo={periodo}
            cargando={cargandoReporte}
          />
        )}
      </section>
    </div>
  )
}

// Normaliza la respuesta del backend a objetos con claves = headers
function normalizarFilas(tipo, data) {
  if (!Array.isArray(data)) return []
  return data.map(item => {
    switch (tipo) {
      case 'ocupacion':
        return {
          'Médico':       item.nombreMedico,
          'Especialidad': item.especialidad,
          'Total Slots':  item.totalSlots,
          'Ocupados':     item.ocupados,
          '% Ocupación':  item.porcentaje?.toFixed(1) + '%',
        }
      case 'ausentismo':
        return {
          'ID':           item.turnoId,
          'Fecha':        item.fecha,
          'Médico':       item.nombreMedico,
          'Especialidad': item.especialidad,
        }
      case 'especialidades':
        return {
          'Especialidad':  item.especialidad,
          'Total Turnos':  item.totalTurnos,
        }
      case 'cancelaciones':
        return {
          'ID':         item.turnoId,
          'Fecha':      item.fecha,
          'Especialidad': item.especialidad,
          'Paciente':   item.pacienteAnonimizado,
          'Motivo':     item.motivo,
        }
      default:
        return item
    }
  })
}

const seccionTitle = { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }
const chipStyle = activo => ({
  padding: '6px 14px', borderRadius: '20px', border: '1px solid',
  borderColor: activo ? '#2563eb' : '#d1d5db',
  background: activo ? '#eff6ff' : 'white',
  color: activo ? '#2563eb' : '#6b7280',
  cursor: 'pointer', fontSize: '0.875rem', fontWeight: activo ? '600' : '400',
})

export default DashboardAdmin