// src/components/medico/CalendarioMedico.jsx
// Grilla semanal — colores sólidos inspirados en BuscarMedico (azul/gris/rojo).
// Bug key prop corregido con Fragment explícito.

import { Fragment } from 'react'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getDiasSemana(lunes) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function labelSemana(lunes) {
  const fin = new Date(lunes)
  fin.setDate(fin.getDate() + 6)
  const o = { day: 'numeric', month: 'short' }
  return `${lunes.toLocaleDateString('es-ES', o)} – ${fin.toLocaleDateString('es-ES', { ...o, year: 'numeric' })}`
}

// ── Paleta de colores sólidos ─────────────────────────────────────────────────
// Inspirada en CalendarioSemana de BuscarMedico: verde vivo para libre,
// azul sólido para ocupado clickeable, rojo para bloqueado, violeta para concluida.
const COLOR = {
  libre:     { bg: '#22c55e', text: '#fff',    border: '#16a34a',  cursor: 'default'  },
  ocupado:   { bg: '#2563eb', text: '#fff',    border: '#1d4ed8',  cursor: 'pointer'  },
  bloqueado: { bg: '#ef4444', text: '#fff',    border: '#dc2626',  cursor: 'default'  },
  concluida: { bg: '#7c3aed', text: '#fff',    border: '#6d28d9',  cursor: 'default'  },
  cancelado: { bg: '#e2e8f0', text: '#94a3b8', border: '#cbd5e1',  cursor: 'default'  },
  vacio:     { bg: 'transparent', text: '',    border: 'transparent', cursor: 'default' },
}

function resolverColor(slot) {
  if (slot.bloqueado)         return COLOR.bloqueado
  if (!slot.turno)            return COLOR.libre
  const e = slot.turno.estado
  if (e === 'CONCLUIDA')      return COLOR.concluida
  if (e === 'CANCELADO')      return COLOR.cancelado
  return COLOR.ocupado
}

export default function CalendarioMedico({
  slots, onSlotClick, semanaBase, onSemanaAnterior, onSemanaSiguiente,
}) {
  const dias = getDiasSemana(semanaBase)
  const horas = [...new Set(slots.map(s => s.hora))].sort()
  const mapa = Object.fromEntries(slots.map(s => [`${s.fecha}__${s.hora}`, s]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Nav semana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onSemanaAnterior} style={btnNavStyle}>← Anterior</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {labelSemana(semanaBase)}
        </span>
        <button onClick={onSemanaSiguiente} style={btnNavStyle}>Siguiente →</button>
      </div>

      {/* Grilla */}
      {horas.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          Sin disponibilidad configurada para esta semana.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px repeat(${dias.length}, 1fr)`,
            minWidth: 540,
          }}>

            {/* Header */}
            <div style={thStyle} />
            {dias.map((fecha, i) => {
              const [, mes, dia] = fecha.split('-')
              return (
                <div key={fecha} style={thStyle}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{DIAS[i]}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{dia}/{mes}</span>
                </div>
              )
            })}

            {/* Filas — Fragment con key para eliminar warning */}
            {horas.map(hora => (
              <Fragment key={hora}>
                {/* Columna hora */}
                <div style={tdHoraStyle}>{hora}</div>

                {/* Celdas de cada día */}
                {dias.map(fecha => {
                  const slot = mapa[`${fecha}__${hora}`]
                  if (!slot) return <div key={`${fecha}-${hora}`} style={tdVacioStyle} />

                  const col = resolverColor(slot)
                  const esClickeable = slot.turno
                    && slot.turno.estado !== 'CONCLUIDA'
                    && slot.turno.estado !== 'CANCELADO'
                    && !slot.bloqueado

                  const nombrePaciente = slot.turno
                    ? `${slot.turno.paciente?.nombre ?? ''} ${slot.turno.paciente?.apellido ?? ''}`.trim()
                    : null

                  return (
                    <button
                      key={`${fecha}-${hora}`}
                      onClick={esClickeable ? () => onSlotClick(slot) : undefined}
                      title={nombrePaciente ?? (slot.bloqueado ? 'Bloqueado' : 'Libre')}
                      style={{
                        background: col.bg,
                        color: col.text,
                        border: `1px solid ${col.border}`,
                        borderRadius: 0,
                        padding: '5px 4px',
                        minHeight: 42,
                        width: '100%',
                        cursor: col.cursor,
                        fontSize: 11,
                        fontWeight: slot.turno ? 600 : 400,
                        fontFamily: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        transition: 'filter 0.1s',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => esClickeable && (e.currentTarget.style.filter = 'brightness(0.9)')}
                      onMouseLeave={e => esClickeable && (e.currentTarget.style.filter = 'none')}
                    >
                      {slot.bloqueado ? (
                        <span style={{ fontSize: 13, opacity: 0.9 }}>✕</span>
                      ) : slot.turno ? (
                        <>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '95%' }}>
                            {nombrePaciente || 'Paciente'}
                          </span>
                          <span style={{ fontSize: 9, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {slot.turno.estado}
                          </span>
                        </>
                      ) : (
                        <span style={{ opacity: 0.7, fontSize: 13 }}>·</span>
                      )}
                    </button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
        {[
          { col: COLOR.libre,     label: 'Libre' },
          { col: COLOR.ocupado,   label: 'Ocupado (click para gestionar)' },
          { col: COLOR.bloqueado, label: 'Bloqueado' },
          { col: COLOR.concluida, label: 'Concluida' },
        ].map(({ col, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: col.bg, border: `1.5px solid ${col.border}`, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 4px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  borderRight: '1px solid #f1f5f9',
}

const tdHoraStyle = {
  padding: '0 8px',
  fontSize: 11, color: '#94a3b8', fontFamily: 'monospace',
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  background: '#f8fafc',
  borderRight: '1px solid #e2e8f0',
  borderBottom: '1px solid #f1f5f9',
  minHeight: 42,
}

const tdVacioStyle = {
  background: '#fafafa',
  borderBottom: '1px solid #f1f5f9',
  borderRight: '1px solid #f1f5f9',
  minHeight: 42,
}

const btnNavStyle = {
  background: 'white',
  color: '#2563eb',
  border: '1.5px solid #bfdbfe',
  borderRadius: 8,
  padding: '7px 18px',
  fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 0.12s',
}