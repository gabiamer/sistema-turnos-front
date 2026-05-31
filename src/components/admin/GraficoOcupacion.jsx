// src/components/admin/GraficoOcupacion.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const FONT = "'DM Sans','Helvetica Neue',sans-serif"

function TooltipPersonalizado({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = d.porcentaje ?? 0
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(74,124,158,0.15)',
      borderRadius: 14,
      padding: '0.85rem 1.1rem',
      fontSize: '0.8rem',
      fontFamily: FONT,
      boxShadow: '0 8px 32px rgba(74,124,158,0.14)',
      minWidth: 160,
    }}>
      <p style={{ fontWeight:600, color:'#1c3545', margin:'0 0 0.5rem', fontSize:'0.85rem' }}>
        {d.medico}
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
        <Row label="Slots totales" valor={d.totalSlots} color="#7fa3b8" />
        <Row label="Ocupados"      valor={d.ocupados}   color="#4a7c9e" />
        <div style={{ height:1, background:'rgba(74,124,158,0.1)', margin:'0.3rem 0' }} />
        <Row label="Ocupación" valor={`${pct.toFixed(1)}%`} color={getColor(pct)} bold />
      </div>
    </div>
  )
}

function Row({ label, valor, color, bold }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:'1.5rem', alignItems:'center' }}>
      <span style={{ color:'#7fa3b8', fontWeight:400 }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 600 : 500 }}>{valor}</span>
    </div>
  )
}

function getColor(pct) {
  if (pct >= 80) return '#27ae60'
  if (pct >= 50) return '#4a7c9e'
  return '#d4a017'
}

function GraficoOcupacion({ datos }) {
  if (!datos || datos.length === 0) {
    return (
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        height:200, color:'#7fa3b8', fontSize:'0.85rem', fontFamily: FONT,
        fontWeight:300, letterSpacing:'0.02em',
      }}>
        Sin datos de ocupación para el período.
      </div>
    )
  }

  const chartData = datos.map(d => ({
    medico:     d.nombreMedico,
    porcentaje: d.porcentaje,
    ocupados:   d.ocupados,
    totalSlots: d.totalSlots,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -8, bottom: 48 }}
        barCategoryGap="35%"
      >
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(74,124,158,0.1)" vertical={false} />
        <XAxis
          dataKey="medico"
          tick={{ fontSize:11, fill:'#7fa3b8', fontFamily: FONT }}
          angle={-28}
          textAnchor="end"
          interval={0}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize:11, fill:'#7fa3b8', fontFamily: FONT }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<TooltipPersonalizado />} cursor={{ fill:'rgba(74,124,158,0.05)', radius:8 }} />
        <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={getColor(entry.porcentaje)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GraficoOcupacion