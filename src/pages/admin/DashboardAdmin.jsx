// src/pages/admin/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from 'react'
import { adminFacade }     from '../../facades/adminFacade'
import SelectorPeriodo     from '../../components/admin/SelectorPeriodo'
import TablaReporte        from '../../components/admin/TablaReporte'
import GraficoOcupacion   from '../../components/admin/GraficoOcupacion'

const FONT       = "'DM Sans','Helvetica Neue',sans-serif"
const FONT_SERIF = "'DM Serif Display',Georgia,serif"

const TIPOS_REPORTE = [
  { key: 'ocupacion',      label: 'Ocupación',      icon: '◈' },
  { key: 'ausentismo',     label: 'Ausentismo',     icon: '◇' },
  { key: 'especialidades', label: 'Especialidades', icon: '◉' },
  { key: 'cancelaciones',  label: 'Cancelaciones',  icon: '◌' },
]

const HEADERS_MAP = {
  ocupacion:      ['Médico', 'Especialidad', 'Total Slots', 'Ocupados', '% Ocupación'],
  ausentismo:     ['ID', 'Fecha', 'Médico', 'Especialidad'],
  especialidades: ['Especialidad', 'Total Turnos'],
  cancelaciones:  ['ID', 'Fecha', 'Especialidad', 'Paciente', 'Motivo'],
}

const KPI_CONFIG = [
  { key: 'confirmados', label: 'Confirmados', color: '#4a7c9e', accent: 'rgba(74,124,158,0.08)' },
  { key: 'cancelados',  label: 'Cancelados',  color: '#c0392b', accent: 'rgba(192,57,43,0.07)'  },
  { key: 'concluidos',  label: 'Concluidos',  color: '#27ae60', accent: 'rgba(39,174,96,0.08)'  },
  { key: 'ausentes',    label: 'Ausentes',    color: '#d4a017', accent: 'rgba(212,160,23,0.08)' },
]

export default function DashboardAdmin() {
  const [kpis, setKpis]               = useState(null)
  const [tipoReporte, setTipoReporte] = useState('ocupacion')
  const [periodo, setPeriodo]         = useState(null)
  const [filas, setFilas]             = useState([])
  const [cargandoKpis, setCargandoKpis]       = useState(true)
  const [cargandoReporte, setCargandoReporte] = useState(false)
  const [errorReporte, setErrorReporte]       = useState('')
  const [kpiVisible, setKpiVisible]           = useState(false)

  useEffect(() => {
    adminFacade.cargarKpis()
      .then(data => { setKpis(data); setTimeout(() => setKpiVisible(true), 80) })
      .catch(() => { setKpis(null); setKpiVisible(true) })
      .finally(() => setCargandoKpis(false))
  }, [])

  const cargarReporte = useCallback(async () => {
    if (!periodo) return
    setCargandoReporte(true); setErrorReporte('')
    try {
      const filas = await adminFacade.cargarReporte(tipoReporte, periodo.inicio, periodo.fin)
      setFilas(filas)
    } catch (err) {
      setErrorReporte(err.response?.data?.error ?? 'Error al cargar el reporte')
      setFilas([])
    } finally { setCargandoReporte(false) }
  }, [tipoReporte, periodo])

  useEffect(() => { cargarReporte() }, [cargarReporte])

  const datosGrafico = tipoReporte === 'ocupacion' && !cargandoReporte
    ? filas.map(f => ({
        nombreMedico: f['Médico'],
        porcentaje:   parseFloat(f['% Ocupación']) || 0,
        ocupados:     parseInt(f['Ocupados']) || 0,
        totalSlots:   parseInt(f['Total Slots']) || 0,
      }))
    : []

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%,    rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 50%,  rgba(220,234,243,0.3) 0%, transparent 70%)
      `,
      fontFamily: FONT,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 2.5rem; }
        }

        .kpi-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(74,124,158,0.16) !important; }

        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { transform: translateY(-1px); }

        .reporte-row { transition: background 0.15s ease; }
        .reporte-row:hover { background: rgba(74,124,158,0.04) !important; }

        .glass-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 30px rgba(74,124,158,0.1);
        }

        /* Ocultar spinner nativo en date inputs */
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.4;
          cursor: pointer;
        }
      `}</style>

      {/* Círculos decorativos de fondo */}
      <div style={{ position:'fixed', top:'-10%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.15)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-8%', right:'-4%', width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,3vw,2rem)', position:'relative', zIndex:1 }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom:'2.5rem', animation:'fadeUp 0.5s ease both' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <p style={{
                fontSize:'0.68rem', fontWeight:500, color:'#4a7c9e',
                letterSpacing:'0.18em', textTransform:'uppercase',
                margin:'0 0 0.5rem',
              }}>
                Administración — Reportes y KPIs
              </p>
              <h1 style={{
                fontFamily: FONT_SERIF,
                fontSize:'clamp(2rem,3.5vw,2.75rem)',
                fontWeight:400, color:'#1c3545',
                lineHeight:1.1, margin:'0 0 0.5rem',
              }}>
                Dashboard{' '}
                <em style={{ fontStyle:'italic', color:'#4a7c9e' }}>administrativo.</em>
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{
                  height:1.5, background:'#4a7c9e', opacity:0.3,
                  animation:'lineGrow 0.6s ease 0.3s both',
                  width:'2.5rem',
                }} />
                <p style={{ color:'#7fa3b8', fontSize:'0.8rem', margin:0, fontWeight:300 }}>
                  {fechaHoy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPIs ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom:'2rem', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <SectionLabel texto="Indicadores de hoy" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
            {KPI_CONFIG.map(({ key, label, color, accent }, i) => (
              <div
                key={key}
                className="kpi-card glass-card"
                style={{
                  padding:'1.4rem 1.5rem',
                  opacity: kpiVisible ? 1 : 0,
                  animation: kpiVisible ? `countUp 0.4s ease ${i * 0.08}s both` : 'none',
                }}
              >
                <p style={{
                  fontSize:'0.65rem', fontWeight:500, color:'#7fa3b8',
                  letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 0.75rem',
                }}>
                  {label}
                </p>

                {/* Barra de acento */}
                <div style={{ height:2, background:color, opacity:0.35, borderRadius:1, marginBottom:'0.75rem', width:'2rem' }} />

                <p style={{
                  fontFamily: FONT_SERIF,
                  fontSize:'2.6rem', color, margin:0,
                  fontWeight:400, lineHeight:1,
                }}>
                  {cargandoKpis ? (
                    <span style={{ fontSize:'1.5rem', color:'#b0c8d4' }}>—</span>
                  ) : (
                    kpis?.[key] ?? '—'
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REPORTES ───────────────────────────────────────────────── */}
        <section style={{ animation:'fadeUp 0.5s ease 0.2s both' }}>
          <SectionLabel texto="Reportes" />

          {/* Tabs */}
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            {TIPOS_REPORTE.map(({ key, label, icon }) => {
              const activo = tipoReporte === key
              return (
                <button
                  key={key}
                  className="tab-btn"
                  onClick={() => setTipoReporte(key)}
                  style={{
                    padding:'0.5rem 1.1rem',
                    borderRadius:50,
                    border:`1.5px solid ${activo ? '#4a7c9e' : 'rgba(74,124,158,0.2)'}`,
                    background: activo ? '#4a7c9e' : 'rgba(255,255,255,0.55)',
                    color: activo ? '#fff' : '#4a7c9e',
                    fontSize:'0.8rem', fontWeight: activo ? 600 : 400,
                    cursor:'pointer', fontFamily: FONT,
                    boxShadow: activo ? '0 4px 16px rgba(74,124,158,0.28)' : 'none',
                    display:'flex', alignItems:'center', gap:'0.35rem',
                    backdropFilter:'blur(8px)',
                  }}
                >
                  <span style={{ fontSize:'0.7rem', opacity: activo ? 1 : 0.6 }}>{icon}</span>
                  {label}
                </button>
              )
            })}
          </div>

          {/* Selector período */}
          <div className="glass-card" style={{ padding:'1.25rem 1.5rem', marginBottom:'1.25rem' }}>
            <SelectorPeriodo onChange={setPeriodo} />
          </div>

          {/* Gráfico (solo ocupación) */}
          {tipoReporte === 'ocupacion' && datosGrafico.length > 0 && (
            <div className="glass-card" style={{ padding:'1.5rem', marginBottom:'1.25rem', animation:'fadeIn 0.4s ease both' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:'0.75rem', marginBottom:'1.25rem' }}>
                <h3 style={{
                  fontFamily: FONT_SERIF,
                  fontSize:'1.15rem', fontWeight:400, color:'#1c3545', margin:0,
                }}>
                  Ocupación por médico
                </h3>
                <div style={{ height:1, background:'rgba(74,124,158,0.15)', flex:1, alignSelf:'center' }} />
              </div>
              <GraficoOcupacion datos={datosGrafico} />
            </div>
          )}

          {/* Tabla */}
          <div className="glass-card" style={{ padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'0.75rem', marginBottom:'1.25rem' }}>
              <h3 style={{
                fontFamily: FONT_SERIF,
                fontSize:'1.15rem', fontWeight:400, color:'#1c3545', margin:0,
              }}>
                {TIPOS_REPORTE.find(t => t.key === tipoReporte)?.label}
              </h3>
              <div style={{ height:1, background:'rgba(74,124,158,0.15)', flex:1, alignSelf:'center' }} />
            </div>

            {errorReporte ? (
              <div style={{
                padding:'0.75rem 1rem',
                background:'rgba(220,38,38,0.06)',
                border:'1.5px solid rgba(220,38,38,0.2)',
                borderRadius:12, color:'#dc2626', fontSize:'0.875rem',
              }}>
                ⚠ {errorReporte}
              </div>
            ) : (
              <TablaReporte
                headers={HEADERS_MAP[tipoReporte]}
                rows={filas}
                cargando={cargandoReporte}
                onExportar={() => adminFacade.exportar(tipoReporte, periodo.inicio, periodo.fin)}
              />
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

function SectionLabel({ texto }) {
  return (
    <p style={{
      fontSize:'0.68rem', fontWeight:500, color:'#4a7c9e',
      letterSpacing:'0.14em', textTransform:'uppercase',
      margin:'0 0 1rem',
    }}>
      {texto}
    </p>
  )
}

