// src/components/ModalCancelarTurno.jsx
// ============================================================
// Sprint 3 — feature/luci-s3-mis-turnos
// CU-02: Cancelar Turno
// Flujos cubiertos:
//   · Cancelación válida     → DELETE /api/turnos/{id} → 200
//   · Fuera de plazo         → 422 → mensaje del CU-02
//   · No autorizado          → 403 → mensaje de error
//   · Turno ya cancelado     → 409 → mensaje
//   · Turno no encontrado    → 404 → mensaje
// ============================================================
import { useState } from 'react'
import { turnoService } from '../services/turnoService'

function ModalCancelarTurno({ turno, onCerrar, onCancelado }) {
  const [fase, setFase]         = useState('confirmacion') // 'confirmacion' | 'cargando' | 'error'
  const [mensajeError, setMsj]  = useState('')

  async function handleConfirmar() {
    setFase('cargando')
    try {
      await turnoService.cancelar(turno.id)
      onCancelado(turno.id)
    } catch (err) {
      const status = err.response?.status
      if (status === 422) {
        setMsj('No es posible cancelar turnos con menos de 2 horas de anticipación. Comuníquese con la recepción.')
      } else if (status === 403) {
        setMsj('No tenés permiso para cancelar este turno.')
      } else if (status === 409) {
        setMsj('Este turno ya fue cancelado.')
      } else if (status === 404) {
        setMsj('No se encontró el turno.')
      } else {
        setMsj('Ocurrió un error al cancelar. Intentá de nuevo.')
      }
      setFase('error')
    }
  }

  const fechaFormateada = formatearFecha(turno.fecha)

  return (
    /* Backdrop */
    <div
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Cancelar turno"
      style={s.backdrop}
    >
      <div onClick={e => e.stopPropagation()} style={s.caja}>

        {/* Header */}
        <div style={s.header}>
          <h2 style={s.titulo}>Cancelar turno</h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar modal"
            style={s.btnX}
          >
            ✕
          </button>
        </div>

        {/* Info del turno */}
        <div style={s.infoBox}>
          <InfoRow label="Médico"       value={`Dr/a. ${turno.medico.nombre} ${turno.medico.apellido ?? ''}`} />
          <InfoRow label="Especialidad" value={turno.medico.especialidad} />
          <InfoRow label="Fecha"        value={fechaFormateada} />
          <InfoRow label="Hora"         value={turno.hora} />
        </div>

        {/* Fase: confirmación */}
        {fase === 'confirmacion' && (
          <>
            <p style={s.pregunta}>
              ¿Estás seguro que deseás cancelar este turno?
            </p>
            <div style={s.botones}>
              <button onClick={onCerrar}      style={s.btnSecundario} aria-label="No cancelar">
                No, volver
              </button>
              <button onClick={handleConfirmar} style={s.btnDanger}    aria-label="Confirmar cancelación">
                Sí, cancelar
              </button>
            </div>
          </>
        )}

        {/* Fase: cargando */}
        {fase === 'cargando' && (
          <div style={s.centrado}>
            <div style={s.spinner} aria-label="Cancelando turno..." />
            <p style={s.textoGris}>Cancelando…</p>
          </div>
        )}

        {/* Fase: error */}
        {fase === 'error' && (
          <>
            <div style={s.alertaError} role="alert">
              ⚠ {mensajeError}
            </div>
            <button onClick={onCerrar} style={{ ...s.btnSecundario, width: '100%', marginTop: '1rem' }}>
              Cerrar
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

function formatearFecha(fechaStr) {
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return fechaStr
  }
}

// ── Estilos ───────────────────────────────────────────────────────────────
const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1200, padding: '1rem',
  },
  caja: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '1.75rem', width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.25rem',
  },
  titulo: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  btnX: {
    background: '#f1f5f9', border: 'none', borderRadius: '8px',
    width: '30px', height: '30px', cursor: 'pointer',
    color: '#64748b', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: '10px', padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
  },
  pregunta: {
    fontSize: '0.9rem', color: '#475569', lineHeight: 1.6,
    marginBottom: '1.25rem', margin: '0 0 1.25rem',
  },
  botones: { display: 'flex', gap: '0.75rem' },
  btnSecundario: {
    flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
    color: '#475569', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer',
  },
  btnDanger: {
    flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
    border: 'none', backgroundColor: '#dc2626',
    color: 'white', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
  },
  alertaError: {
    padding: '0.875rem 1rem', borderRadius: '10px',
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', fontSize: '0.875rem', lineHeight: 1.5,
  },
  centrado: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' },
  spinner: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#2563eb',
    animation: 'spin 0.8s linear infinite',
  },
  textoGris: { color: '#64748b', fontSize: '0.875rem', margin: 0 },
}

export default ModalCancelarTurno