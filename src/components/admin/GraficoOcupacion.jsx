// src/components/admin/GraficoOcupacion.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

function TooltipPersonalizado({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb',
      borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem',
    }}>
      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{d.medico}</p>
      <p>Slots totales: {d.totalSlots}</p>
      <p>Ocupados: {d.ocupados}</p>
      <p style={{ color: '#2563eb', fontWeight: '600' }}>Ocupación: {d.porcentaje.toFixed(1)}%</p>
    </div>
  )
}

function GraficoOcupacion({ datos }) {
  if (!datos || datos.length === 0) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Sin datos de ocupación.</p>
  }

  const chartData = datos.map(d => ({
    medico: d.nombreMedico,
    porcentaje: d.porcentaje,
    ocupados: d.ocupados,
    totalSlots: d.totalSlots,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="medico"
          tick={{ fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<TooltipPersonalizado />} />
        <Bar dataKey="porcentaje" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GraficoOcupacion