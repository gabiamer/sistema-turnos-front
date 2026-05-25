// src/pages/MisTurnos.jsx
import { useState, useEffect } from 'react'
import axiosInstance from '../services/axiosInstance'

// ─── Mock para usar mientras Ana sube el endpoint GET /api/turnos ───────────
const USAR_MOCK = false // cambiá a false cuando el endpoint esté listo

const turnosMock = [
  {
    id: 1,
    fecha: '2026-06-02',
    hora: '09:00',
    estado: 'CONFIRMADO',
    medico: { nombre: 'Carlos', apellido: 'Soria', especialidad: 'Cardiología' },
  },
  {
    id: 2,
    fecha: '2026-06-10',
    hora: '10:30',
    estado: 'CONFIRMADO',
    medico: { nombre: 'Laura', apellido: 'Paz', especialidad: 'Clínica General' },
  },
]
// ────────────────────────────────────────────────────────────────────────────

const ESTADO_COLOR = {
  CONFIRMADO: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  PENDIENTE:  { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  CANCELADO:  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
}

function MisTurnos() {
  const [paciente, setPaciente] = useState(null)
  const [turnos, setTurnos]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // Leer paciente de sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('paciente')
    if (stored) {
      try {
        setPaciente(JSON.parse(stored))
      } catch {
        // sessionStorage corrupto: lo ignoramos
      }
    }
    setLoading(false)
  }, [])

  // Cargar turnos cuando tengamos paciente con id
  useEffect(() => {
    if (!paciente) return

    // El backend devuelve el id en la respuesta del POST /api/pacientes
    // Si el paciente viene del formulario recién registrado puede traer el id
    // Si no tiene id todavía (registro nuevo sin respuesta guardada) usamos mock
    const pacienteId = paciente.id

    if (USAR_MOCK || !pacienteId) {
      setTurnos(turnosMock)
      return
    }

    setLoading(true)
    axiosInstance
      .get(`/api/turnos?pacienteId=${pacienteId}`)
      .then(res => setTurnos(res.data))
      .catch(() => setError('No se pudieron cargar los turnos. Intentá más tarde.'))
      .finally(() => setLoading(false))
  }, [paciente])

  // ── Sin paciente registrado ──────────────────────────────────────────────
  if (!loading && !paciente) {
    return (
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Mis Turnos
        </h1>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          color: '#64748b',
          fontSize: '0.95rem',
        }}>
          Primero registrá tus datos en la{' '}
          <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            página de inicio
          </a>{' '}
          para ver tus turnos.
        </div>
      </div>
    )
  }

  // ── Cargando ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
        Cargando turnos...
      </div>
    )
  }

  // ── Error de red ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        color: '#dc2626',
        fontSize: '0.9rem',
      }}>
        ⚠ {error}
      </div>
    )
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        Mis Turnos
      </h1>

      {paciente && (
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {paciente.nombre} {paciente.apellido} — CI: {paciente.ci}
        </p>
      )}

      {turnos.length === 0 ? (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          color: '#64748b',
          fontSize: '0.95rem',
          textAlign: 'center',
        }}>
          No tenés turnos agendados aún.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {turnos.map(turno => {
            const colores = ESTADO_COLOR[turno.estado] ?? ESTADO_COLOR.CONFIRMADO
            return (
              <div
                key={turno.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                {/* Info médico y fecha */}
                <div>
                  <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.2rem' }}>
                    Dr/a. {turno.medico.nombre} {turno.medico.apellido}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    {turno.medico.especialidad}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#334155' }}>
                    📅 {formatearFecha(turno.fecha)} &nbsp; 🕐 {turno.hora}
                  </p>
                </div>

                {/* Badge de estado */}
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  backgroundColor: colores.bg,
                  border: `1px solid ${colores.border}`,
                  color: colores.text,
                  whiteSpace: 'nowrap',
                }}>
                  {turno.estado}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatearFecha(fechaStr) {
  // fechaStr: '2026-06-02' → 'lun 2 jun 2026'
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    const fecha = new Date(anio, mes - 1, dia)
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return fechaStr
  }
}

export default MisTurnos