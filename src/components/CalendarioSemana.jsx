// ============================================================
// CalendarioSemana.jsx — Luciana Sprint 1
// Grilla 7 columnas × N filas de horarios
// Props:
//   slots        : [{ fecha, hora, disponible, bloqueoActivo }]
//   onSlotClick  : (slot) => void   — solo se llama si slot libre
// Sprint 2: los slots vendrán del GET real de disponibilidad
// ============================================================
import { useState } from "react";

// Retorna el lunes de la semana que contiene `date`
function getLunes(date) {
  const d = new Date(date);
  const dia = d.getDay(); // 0=dom, 1=lun, ...
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatFecha(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarioSemana({ slots = [], onSlotClick }) {
  const [semanaOffset, setSemanaOffset] = useState(0);

  // Calcular lunes de la semana actual + offset
  const hoy = new Date();
  const lunesBase = getLunes(hoy);
  const lunes = new Date(lunesBase);
  lunes.setDate(lunes.getDate() + semanaOffset * 7);

  // Cabeceras de los 7 días
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  // Obtener horas únicas ordenadas
  const horas = [...new Set(slots.map((s) => s.hora))].sort();

  // Índice rápido: "fecha|hora" → slot
  const slotIndex = {};
  slots.forEach((s) => {
    slotIndex[`${s.fecha}|${s.hora}`] = s;
  });

  const handleClick = (slot) => {
    if (!slot || !slot.disponible || slot.bloqueoActivo) return;
    if (onSlotClick) onSlotClick(slot);
  };

  return (
    <div className="calendario-wrapper">
      {/* Navegación semana */}
      <div className="cal-nav">
        <button
          className="cal-btn"
          onClick={() => setSemanaOffset((o) => o - 1)}
          aria-label="Semana anterior"
        >
          ← Anterior
        </button>
        <span className="cal-semana-label">
          Semana del {formatFecha(diasSemana[0])} al {formatFecha(diasSemana[6])}
        </span>
        <button
          className="cal-btn"
          onClick={() => setSemanaOffset((o) => o + 1)}
          aria-label="Semana siguiente"
        >
          Siguiente →
        </button>
      </div>

      {/* Grilla */}
      <div className="cal-grid-container" role="grid" aria-label="Calendario de disponibilidad">
        {/* Fila de encabezados */}
        <div className="cal-grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
          <div className="cal-header-cell" />
          {diasSemana.map((fecha, i) => (
            <div key={fecha} className="cal-header-cell" role="columnheader">
              <span className="cal-dia-nombre">{DIAS[i]}</span>
              <span className="cal-dia-fecha">{formatFecha(fecha)}</span>
            </div>
          ))}
        </div>

        {/* Filas de horarios */}
        {horas.length === 0 ? (
          <div className="cal-empty">Sin disponibilidad este período</div>
        ) : (
          horas.map((hora) => (
            <div
              key={hora}
              className="cal-grid"
              style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}
            >
              {/* Columna de hora */}
              <div className="cal-hora-cell">{hora}</div>
              {/* Celda por día */}
              {diasSemana.map((fecha) => {
                const slot = slotIndex[`${fecha}|${hora}`];
                const libre     = slot?.disponible && !slot?.bloqueoActivo;
                const bloqueado = slot?.bloqueoActivo;
                const ocupado   = slot && !slot.disponible;
                const sinDatos  = !slot;

                let cls = "cal-slot";
                if (libre)     cls += " cal-slot--libre";
                else if (bloqueado) cls += " cal-slot--bloqueado";
                else if (ocupado)   cls += " cal-slot--ocupado";
                else                cls += " cal-slot--vacio";

                return (
                  <div
                    key={fecha}
                    className={cls}
                    role="gridcell"
                    aria-label={
                      libre
                        ? `Disponible ${fecha} ${hora}`
                        : `No disponible ${fecha} ${hora}`
                    }
                    tabIndex={libre ? 0 : -1}
                    onClick={() => handleClick(slot)}
                    onKeyDown={(e) => e.key === "Enter" && handleClick(slot)}
                  >
                    {libre && <span className="cal-slot-icon">✓</span>}
                    {bloqueado && <span className="cal-slot-icon">🔒</span>}
                    {ocupado && <span className="cal-slot-icon">✗</span>}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Leyenda */}
      <div className="cal-leyenda">
        <span className="ley-item ley-libre">■ Disponible</span>
        <span className="ley-item ley-ocupado">■ Ocupado</span>
        <span className="ley-item ley-bloqueado">■ Reserva en curso</span>
      </div>
    </div>
  );
}
