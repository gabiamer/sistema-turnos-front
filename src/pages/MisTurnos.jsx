// src/pages/MisTurnos.jsx
// ============================================================
// Sprint 3 — feature/luci-s3-mis-turnos
// CU-02: Cancelar Turno · GET /api/turnos · DELETE /api/turnos/{id}
// Se conecta al endpoint real de Ana (disponible desde el mar 20 may)
// ============================================================
import { useState, useEffect } from 'react'
import { turnoService } from '../services/turnoService'
import ModalCancelarTurno from '../components/ModalCancelarTurno'

// ── Colores por estado — incluye BLOQUEADO y EXPIRADO (añadidos en S1) ──────
const ESTADO_COLOR = {
  CONFIRMADO: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a',  label: 'Confirmado'  },
  PENDIENTE:  { bg: '#fefce8', border: '#fde047', text: '#ca8a04',  label: 'Pendiente'   },
  CANCELADO:  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626',  label: 'Cancelado'   },
  BLOQUEADO:  { bg: '#f0f4ff', border: '#a5b4fc', text: '#4338ca',  label: 'Bloqueando…' },
  EXPIRADO:   { bg: '#f8fafc', border: '#cbd5e1', text: '#94a3b8',  label: 'Expirado'    },
}

// Estados en los que el paciente puede cancelar
const CANCELABLES = ['CONFIRMADO', 'PENDIENTE']

function MisTurnos() {
  const [paciente, setPaciente]             = useState(null)
  const [turnos, setTurnos]                 = useState([])
  const [loading, setLoading]               = useState(true)
  const [errorCarga, setErrorCarga]         = useState('')
  const [turnoACancelar, setTurnoACancelar] = useState(null)   // turno seleccionado para modal
  const [mensajeExito, setMensajeExito]     = useState('')

  // ── Leer paciente de sessionStorage (igual que hacen Adri y Alex) ─────────
  useEffect(() => {
    const stored = sessionStorage.getItem('paciente')
    if (stored) {
      try { setPaciente(JSON.parse(stored)) } catch { /* sessionStorage corrupto */ }
    }
    setLoading(false)
  }, [])

  // ── Cargar turnos en cuanto tengamos el pacienteId ────────────────────────
  useEffect(() => {
    if (!paciente?.id) return

    setLoading(true)
    setErrorCarga('')

    turnoService
      .listar(paciente.id)
      .then(data => setTurnos(data))
      .catch(() => setErrorCarga('No se pudieron cargar los turnos. Intentá más tarde.'))
      .finally(() => setLoading(false))
  }, [paciente])

  // ── Callback que llama el modal cuando la cancelación fue exitosa ─────────
  function handleCancelacionExitosa(turnoId) {
    setTurnos(prev =>
      prev.map(t => t.id === turnoId ? { ...t, estado: 'CANCELADO' } : t)
    )
    setTurnoACancelar(null)
    setMensajeExito('Turno cancelado correctamente.')
    setTimeout(() => setMensajeExito(''), 4000)
  }

  // ── Sin paciente ──────────────────────────────────────────────────────────
  if (!loading && !paciente) {
    return (
      <div style={styles.wrapper}>
        <h1 style={styles.titulo}>Mis Turnos</h1>
        <div style={styles.infoBox}>
          Primero registrá tus datos en la{' '}
          <a href="/" style={styles.link}>página de inicio</a>{' '}
          para ver tus turnos.
        </div>
      </div>
    )
  }

  // ── Cargando ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.wrapper}>
        <h1 style={styles.titulo}>Mis Turnos</h1>
        <div style={styles.textoGris}>Cargando turnos…</div>
      </div>
    )
  }

  // ── Error de red ──────────────────────────────────────────────────────────
  if (errorCarga) {
    return (
      <div style={styles.wrapper}>
        <h1 style={styles.titulo}>Mis Turnos</h1>
        <div style={{ ...styles.alertaBox, backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          ⚠ {errorCarga}
        </div>
      </div>
    )
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.titulo}>Mis Turnos</h1>

      {paciente && (
        <p style={styles.subtitulo}>
          {paciente.nombre} {paciente.apellido} — CI: {paciente.ci}
        </p>
      )}

      {/* Toast de éxito */}
      {mensajeExito && (
        <div style={{ ...styles.alertaBox, backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', marginBottom: '1.25rem' }}>
          ✓ {mensajeExito}
        </div>
      )}

      {/* Lista vacía */}
      {turnos.length === 0 ? (
        <div style={styles.infoBox}>No tenés turnos agendados aún.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {turnos.map(turno => {
            const colores    = ESTADO_COLOR[turno.estado] ?? ESTADO_COLOR.CONFIRMADO
            const cancelable = CANCELABLES.includes(turno.estado)

            return (
              <div key={turno.id} style={styles.card}>

                {/* Info izquierda */}
                <div style={{ flex: 1 }}>
                  <p style={styles.cardNombre}>
                    Dr/a. {turno.medico.nombre} {turno.medico.apellido ?? ''}
                  </p>
                  <p style={styles.cardEsp}>{turno.medico.especialidad}</p>
                  <p style={styles.cardFecha}>
                    📅 {formatearFecha(turno.fecha)} &nbsp; 🕐 {turno.hora}
                  </p>
                </div>

                {/* Chip de estado + botón cancelar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span
                    aria-label={`Estado del turno: ${colores.label}`}
                    style={{
                      ...styles.chip,
                      backgroundColor: colores.bg,
                      border: `1px solid ${colores.border}`,
                      color: colores.text,
                    }}
                  >
                    {colores.label}
                  </span>

                  {cancelable && (
                    <button
                      aria-label={`Cancelar turno del ${turno.fecha} a las ${turno.hora}`}
                      onClick={() => setTurnoACancelar(turno)}
                      style={styles.btnCancelar}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {turnoACancelar && (
        <ModalCancelarTurno
          turno={turnoACancelar}
          onCerrar={() => setTurnoACancelar(null)}
          onCancelado={handleCancelacionExitosa}
        />
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatearFecha(fechaStr) {
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return fechaStr
  }
}

// ── Estilos inline (mismo enfoque que Adri y ModalTurno) ─────────────────
const styles = {
  wrapper:   { maxWidth: 580, padding: '0 0.5rem' },
  titulo:    { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#1e293b' },
  subtitulo: { color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' },
  textoGris: { color: '#64748b', fontSize: '0.95rem' },
  infoBox: {
    padding: '1.5rem', backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '12px',
    color: '#64748b', fontSize: '0.95rem', textAlign: 'center',
  },
  alertaBox: {
    padding: '0.875rem 1.125rem', borderRadius: '10px',
    border: '1px solid', fontSize: '0.875rem', lineHeight: 1.5,
  },
  card: {
    backgroundColor: 'white', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '1.25rem 1.5rem',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '1rem',
  },
  cardNombre: { fontWeight: '600', color: '#1e293b', marginBottom: '0.2rem', margin: '0 0 0.2rem' },
  cardEsp:    { fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.4rem' },
  cardFecha:  { fontSize: '0.875rem', color: '#334155', margin: 0 },
  chip: {
    fontSize: '0.72rem', fontWeight: '600',
    padding: '0.3rem 0.75rem', borderRadius: '999px',
    whiteSpace: 'nowrap',
  },
  btnCancelar: {
    fontSize: '0.78rem', fontWeight: '500',
    padding: '0.3rem 0.85rem', borderRadius: '999px',
    border: '1px solid #fecaca', backgroundColor: '#fef2f2',
    color: '#dc2626', cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  link: { color: '#2563eb', textDecoration: 'underline' },
}

export default MisTurnos