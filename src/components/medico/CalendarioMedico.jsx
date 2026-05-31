// src/components/medico/CalendarioMedico.jsx
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

// ── Paleta coherente con el resto de la app ──────────────────────────────────
const COLOR = {
  libre:     { bg: 'rgba(74,124,158,0.10)', text: '#4a7c9e',  border: 'rgba(74,124,158,0.18)', cursor: 'default' },
  ocupado:   { bg: 'rgba(74,124,158,0.82)', text: '#fff',     border: '#3a6282',               cursor: 'pointer' },
  bloqueado: { bg: 'rgba(220,38,38,0.10)',  text: '#dc2626',  border: 'rgba(220,38,38,0.2)',   cursor: 'default' },
  concluida: { bg: 'rgba(100,116,139,0.12)',text: '#64748b',  border: 'rgba(100,116,139,0.2)', cursor: 'default' },
  cancelado: { bg: 'rgba(226,232,240,0.5)', text: '#94a3b8',  border: 'rgba(203,213,225,0.5)', cursor: 'default' },
}

function resolverColor(slot) {
  if (slot.bloqueado)              return COLOR.bloqueado
  if (!slot.turno)                 return COLOR.libre
  const e = slot.turno.estado
  if (e === 'CONCLUIDA')           return COLOR.concluida
  if (e === 'CANCELADO')           return COLOR.cancelado
  return COLOR.ocupado
}

export default function CalendarioMedico({
  slots, onSlotClick, semanaBase, onSemanaAnterior, onSemanaSiguiente,
}) {
  const dias  = getDiasSemana(semanaBase)
  const horas = [...new Set(slots.map(s => s.hora))].sort()
  const mapa  = Object.fromEntries(slots.map(s => [`${s.fecha}__${s.hora}`, s]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .cal-slot-clickeable:hover { filter: brightness(0.92) !important; }
      `}</style>

      {/* ── Nav semana ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)',
        borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.9)',
        boxShadow: '0 2px 12px rgba(74,124,158,0.08)',
        padding: '10px 16px',
      }}>
        <button onClick={onSemanaAnterior} style={btnNavStyle}>← Anterior</button>
        <span style={{
          flex: 1, textAlign: 'center',
          fontSize: 14, fontWeight: 500, color: '#1c3545',
          letterSpacing: '-0.01em',
        }}>
          {labelSemana(semanaBase)}
        </span>
        <button onClick={onSemanaSiguiente} style={btnNavStyle}>Siguiente →</button>
      </div>

      {/* ── Grilla ── */}
      {horas.length === 0 ? (
        <div style={{
          padding: '2.5rem', textAlign: 'center',
          color: '#7fa3b8', fontSize: 14,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
          borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.9)',
        }}>
          Sin disponibilidad configurada para esta semana.
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          borderRadius: 16,
          border: '1.5px solid rgba(255,255,255,0.9)',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(74,124,158,0.10)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px repeat(${dias.length}, 1fr)`,
            minWidth: 540,
          }}>

            {/* Header días */}
            <div style={thStyle} />
            {dias.map((fecha, i) => {
              const [, mes, dia] = fecha.split('-')
              return (
                <div key={fecha} style={thStyle}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4a7c9e', letterSpacing: '0.04em' }}>{DIAS[i]}</span>
                  <span style={{ fontSize: 10, color: '#a8c4d4', marginTop: 2 }}>{dia}/{mes}</span>
                </div>
              )
            })}

            {/* Filas horarias */}
            {horas.map(hora => (
              <Fragment key={hora}>
                <div style={tdHoraStyle}>{hora}</div>

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
                      className={esClickeable ? 'cal-slot-clickeable' : ''}
                      onClick={esClickeable ? () => onSlotClick(slot) : undefined}
                      title={nombrePaciente ?? (slot.bloqueado ? 'Bloqueado' : 'Libre')}
                      style={{
                        background:  col.bg,
                        color:       col.text,
                        border:      `1px solid ${col.border}`,
                        borderRadius: 0,
                        padding:     '5px 4px',
                        minHeight:   44,
                        width:       '100%',
                        cursor:      col.cursor,
                        fontSize:    11,
                        fontWeight:  slot.turno ? 600 : 400,
                        fontFamily:  'inherit',
                        display:     'flex',
                        flexDirection: 'column',
                        alignItems:  'center',
                        justifyContent: 'center',
                        gap:         2,
                        transition:  'filter 0.12s',
                        overflow:    'hidden',
                      }}
                    >
                      {slot.bloqueado ? (
                        <span style={{ fontSize: 13, opacity: 0.6 }}>✕</span>
                      ) : slot.turno ? (
                        <>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '95%' }}>
                            {nombrePaciente || 'Paciente'}
                          </span>
                          <span style={{ fontSize: 9, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {slot.turno.estado}
                          </span>
                        </>
                      ) : (
                        <span style={{ opacity: 0.35, fontSize: 13 }}>·</span>
                      )}
                    </button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Leyenda ── */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
        borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.9)',
        fontSize: 12,
      }}>
        {[
          { col: COLOR.libre,     label: 'Libre' },
          { col: COLOR.ocupado,   label: 'Ocupado (click para gestionar)' },
          { col: COLOR.bloqueado, label: 'Bloqueado' },
          { col: COLOR.concluida, label: 'Concluida' },
        ].map(({ col, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4a7c9e' }}>
            <span style={{
              width: 13, height: 13, borderRadius: 4,
              background: col.bg, border: `1.5px solid ${col.border}`,
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Estilos base ──────────────────────────────────────────────────────────────

const thStyle = {
  padding: '10px 4px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  background: 'rgba(248,250,252,0.8)',
  borderBottom: '1px solid rgba(74,124,158,0.1)',
  borderRight:  '1px solid rgba(74,124,158,0.06)',
}

const tdHoraStyle = {
  padding: '0 10px',
  fontSize: 10, color: '#a8c4d4',
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  background: 'rgba(248,250,252,0.8)',
  borderRight:  '1px solid rgba(74,124,158,0.1)',
  borderBottom: '1px solid rgba(74,124,158,0.05)',
  minHeight: 44,
}

const tdVacioStyle = {
  background: 'transparent',
  borderBottom: '1px solid rgba(74,124,158,0.05)',
  borderRight:  '1px solid rgba(74,124,158,0.05)',
  minHeight: 44,
}

const btnNavStyle = {
  background: 'rgba(255,255,255,0.9)',
  color: '#4a7c9e',
  border: '1.5px solid rgba(74,124,158,0.2)',
  borderRadius: 50,
  padding: '7px 18px',
  fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'all 0.15s',
  letterSpacing: '0.01em',
}