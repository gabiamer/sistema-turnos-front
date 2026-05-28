// src/components/CalendarioSemana.jsx
// ============================================================
// Sprint 1 — feature/luci-s1-calendario
// Componente puro: recibe slots como prop, no hace fetch
// Props:
//   slots       → [{ fecha, hora, disponible, bloqueoActivo }]
//   onSlotClick → fn(slot) al clickear un slot libre
// Días: lun–vie (columnas); horas: filas
// Colores: libre=verde, ocupado=gris, bloqueoActivo=naranja
// ============================================================

function CalendarioSemana({ slots = [], onSlotClick }) {

  if (slots.length === 0) {
    return (
      <div className="cal-empty">
        Sin disponibilidad este período.
      </div>
    )
  }

  // ── Agrupar por fecha ────────────────────────────────────────────────────
  const porFecha = slots.reduce((acc, slot) => {
    if (!acc[slot.fecha]) acc[slot.fecha] = []
    acc[slot.fecha].push(slot)
    return acc
  }, {})

  const fechas = Object.keys(porFecha).sort()

  // ── Horarios únicos (filas) ──────────────────────────────────────────────
  const horas = [...new Set(slots.map(s => s.hora))].sort()

  // ── Helpers ─────────────────────────────────────────────────────────────
  function formatearDia(fechaStr) {
    // '2026-05-04' → 'Lun\n4 may'
    try {
      const [a, m, d] = fechaStr.split('-').map(Number)
      const fecha = new Date(a, m - 1, d)
      return {
        nombre: fecha.toLocaleDateString('es-AR', { weekday: 'short' }),
        dia: fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      }
    } catch {
      return { nombre: fechaStr, dia: '' }
    }
  }

  function clasificarSlot(slot) {
    // bloqueoActivo tiene prioridad sobre disponible
    if (slot.bloqueoActivo) return 'bloqueado'
    if (!slot.disponible)   return 'ocupado'
    return 'libre'
  }

  const totalCols = 1 + fechas.length // col hora + una col por fecha

  return (
    <div className="calendario-wrapper">

      {/* ── Grilla ─────────────────────────────────────────────────────── */}
      <div className="cal-grid-container">
        <div
          className="cal-grid"
          style={{ gridTemplateColumns: `56px repeat(${fechas.length}, 1fr)` }}
          role="grid"
          aria-label="Calendario de disponibilidad"
        >

          {/* Fila de encabezados */}
          <div className="cal-header-cell" aria-hidden="true" />   {/* esquina */}
          {fechas.map(fecha => {
            const { nombre, dia } = formatearDia(fecha)
            return (
              <div key={fecha} className="cal-header-cell" role="columnheader">
                <span className="cal-dia-nombre">{nombre}</span>
                <span className="cal-dia-fecha">{dia}</span>
              </div>
            )
          })}

          {/* Filas de horarios */}
          {horas.map(hora => (
            <>
              {/* Celda de hora */}
              <div key={`h-${hora}`} className="cal-hora-cell" role="rowheader">
                {hora}
              </div>

              {/* Celda por fecha */}
              {fechas.map(fecha => {
                const slot = porFecha[fecha]?.find(s => s.hora === hora)

                if (!slot) {
                  return (
                    <div
                      key={`${fecha}-${hora}`}
                      className="cal-slot cal-slot--vacio"
                      aria-hidden="true"
                    />
                  )
                }

                const tipo = clasificarSlot(slot)

                return (
                  <button
                    key={`${fecha}-${hora}`}
                    className={`cal-slot cal-slot--${tipo}`}
                    disabled={tipo !== 'libre'}
                    onClick={() => tipo === 'libre' && onSlotClick?.(slot)}
                    title={
                      tipo === 'libre'     ? `Disponible — ${fecha} ${hora}` :
                      tipo === 'bloqueado' ? 'Bloqueado por el médico' :
                                            'Ocupado'
                    }
                    aria-label={
                      tipo === 'libre'
                        ? `Reservar turno el ${fecha} a las ${hora}`
                        : `${hora} — ${tipo}`
                    }
                  >
                    <span className="cal-slot-icon">
                      {tipo === 'libre' ? '●' : tipo === 'bloqueado' ? '◐' : '○'}
                    </span>
                  </button>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* ── Leyenda ─────────────────────────────────────────────────────── */}
      <div className="cal-leyenda" aria-label="Referencias del calendario">
        <span className="ley-item ley-libre">    ● Libre</span>
        <span className="ley-item ley-ocupado">  ○ Ocupado</span>
        <span className="ley-item ley-bloqueado">◐ Bloqueado</span>
      </div>

    </div>
  )
}

export default CalendarioSemana