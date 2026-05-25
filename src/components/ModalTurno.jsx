// src/components/ModalTurno.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { turnoService } from '../services/turnoService'

const DURACION_BLOQUEO = 5 * 60 // 5 minutos en segundos

function ModalTurno({ slot, medico, onCerrar }) {
  const navigate = useNavigate()

  // Fases: 'resumen' | 'bloqueando' | 'confirmando' | 'expirado' | 'error'
  const [fase, setFase] = useState('resumen')
  const [segundosRestantes, setSegundosRestantes] = useState(DURACION_BLOQUEO)
  const [turnoId, setTurnoId] = useState(null)
  const [mensajeError, setMensajeError] = useState('')
  const [loadingConfirmar, setLoadingConfirmar] = useState(false)

  const intervaloRef = useRef(null)

  // Arrancar countdown cuando el bloqueo está activo
  useEffect(() => {
    if (fase !== 'bloqueando') return

    intervaloRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current)
          setFase('expirado')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervaloRef.current)
  }, [fase])

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => clearInterval(intervaloRef.current)
  }, [])

  // Paso 1: solicitar bloqueo al back
  async function handleSolicitar() {
    setFase('bloqueando')
    setMensajeError('')

    try {
      const data = await turnoService.solicitar(medico.id, slot.fecha, slot.hora)
      setTurnoId(data.turnoId)
      // El countdown ya arrancó con el useEffect de arriba
    } catch (err) {
      clearInterval(intervaloRef.current)
      if (err.response?.status === 409) {
        setMensajeError('Este turno ya fue tomado por otro paciente.')
      } else if (err.response?.status === 422) {
        setMensajeError('Ya tenés un turno reservado para ese día.')
      } else {
        setMensajeError('No se pudo reservar el turno. Intentá de nuevo.')
      }
      setFase('error')
    }
  }

  // Paso 2: confirmar turno
  async function handleConfirmar() {
    if (!turnoId) return
    setLoadingConfirmar(true)
    clearInterval(intervaloRef.current)

    try {
      await turnoService.confirmar(turnoId)
      navigate('/mis-turnos')
    } catch (err) {
      if (err.response?.status === 410) {
        setFase('expirado')
      } else if (err.response?.status === 409) {
        setMensajeError('Este turno ya fue tomado por otro paciente.')
        setFase('error')
      } else {
        setMensajeError('Error al confirmar el turno. Intentá de nuevo.')
        setFase('error')
      }
    } finally {
      setLoadingConfirmar(false)
    }
  }

  const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, '0')
  const segundos = String(segundosRestantes % 60).padStart(2, '0')
  const porcentaje = (segundosRestantes / DURACION_BLOQUEO) * 100
  const colorBarra = porcentaje > 50 ? '#22c55e' : porcentaje > 20 ? '#f59e0b' : '#ef4444'

  return (
    // Overlay
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      {/* Card — detener propagación para no cerrar al clickear adentro */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>
            Reservar turno
          </h2>
          <button
            onClick={onCerrar}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Resumen del turno — siempre visible */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}>
          <InfoRow label="Médico"       value={`Dr/a. ${medico.nombre} ${medico.apellido}`} />
          <InfoRow label="Especialidad" value={medico.especialidad} />
          <InfoRow label="Fecha"        value={formatearFecha(slot.fecha)} />
          <InfoRow label="Hora"         value={slot.hora} />
        </div>

        {/* FASE: resumen inicial */}
        {fase === 'resumen' && (
          <>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Al confirmar, se bloqueará el turno por <strong>5 minutos</strong> para que puedas completar la reserva.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onCerrar} style={btnSecundario}>Cancelar</button>
              <button onClick={handleSolicitar} style={btnPrimario}>Reservar</button>
            </div>
          </>
        )}

        {/* FASE: bloqueo activo con countdown */}
        {fase === 'bloqueando' && (
          <>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Tu turno está reservado temporalmente. Confirmalo antes de que expire el tiempo.
            </p>

            {/* Barra de progreso */}
            <div style={{ backgroundColor: '#e2e8f0', borderRadius: '99px', height: '8px', marginBottom: '0.5rem' }}>
              <div style={{
                width: `${porcentaje}%`,
                height: '100%',
                borderRadius: '99px',
                backgroundColor: colorBarra,
                transition: 'width 1s linear, background-color 0.5s',
              }} />
            </div>

            {/* Timer */}
            <p style={{ textAlign: 'center', fontWeight: '700', fontSize: '1.5rem', color: colorBarra, marginBottom: '1.25rem', fontVariantNumeric: 'tabular-nums' }}>
              {minutos}:{segundos}
            </p>

            <button
              onClick={handleConfirmar}
              disabled={loadingConfirmar}
              style={{ ...btnPrimario, width: '100%', opacity: loadingConfirmar ? 0.7 : 1, cursor: loadingConfirmar ? 'not-allowed' : 'pointer' }}
            >
              {loadingConfirmar ? 'Confirmando...' : 'Confirmar turno'}
            </button>
          </>
        )}

        {/* FASE: expirado */}
        {fase === 'expirado' && (
          <>
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}>
              ⏱ Bloqueo expirado. El turno volvió a estar disponible.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onCerrar} style={btnSecundario}>Cerrar</button>
              <button onClick={() => { setFase('resumen'); setSegundosRestantes(DURACION_BLOQUEO) }} style={btnPrimario}>
                Intentar de nuevo
              </button>
            </div>
          </>
        )}

        {/* FASE: error */}
        {fase === 'error' && (
          <>
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
            }}>
              ⚠ {mensajeError}
            </div>
            <button onClick={onCerrar} style={{ ...btnSecundario, width: '100%' }}>Cerrar</button>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
      <span style={{ color: '#94a3b8', minWidth: '90px' }}>{label}</span>
      <span style={{ color: '#1e293b', fontWeight: '500' }}>{value}</span>
    </div>
  )
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

const btnPrimario = {
  flex: 1,
  padding: '0.65rem 1rem',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
}

const btnSecundario = {
  flex: 1,
  padding: '0.65rem 1rem',
  backgroundColor: 'white',
  color: '#475569',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: '500',
  cursor: 'pointer',
}

export default ModalTurno