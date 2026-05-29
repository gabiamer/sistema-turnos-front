// src/pages/medico/VistaMedico.jsx
// Conectado 100% al backend real:
//   - GET    /api/medicos/{id}/agenda-semana
//   - PATCH  /api/turnos/{id}/estado
//   - PUT    /api/turnos/{id}/reprogramar
//   - DELETE /api/turnos/{id}/medico

import { useState, useEffect, useCallback } from 'react'
import { useMedicoStore } from '../../store/medicoStore'
import CalendarioMedico   from '../../components/medico/CalendarioMedico'
import PanelCita          from '../../components/medico/PanelCita'
import ModalReprogramar   from '../../components/medico/ModalReprogramar'
import ModalCancelar      from '../../components/medico/ModalCancelar'
import Toast              from '../../components/medico/Toast'
import { medicoService }  from '../../services/medicoService'
import { turnoService }   from '../../services/turnoService'

const MEDICO_ID = 1

function getLunesActual() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff)
  hoy.setHours(0, 0, 0, 0)
  return hoy
}
function toISO(fecha) { return fecha.toISOString().split('T')[0] }

export default function VistaMedico() {
  const {
    slots, setSlots, loading, setLoading, error, setError,
    citaSeleccionada, seleccionarCita, cerrarPanel,
    actualizarEstadoTurno, liberarSlot, reprogramarTurno,
  } = useMedicoStore()

  const [medico, setMedico]               = useState(null)
  const [semanaBase, setSemanaBase]       = useState(getLunesActual)
  const [modal, setModal]                 = useState(null)
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [errorAccion, setErrorAccion]     = useState(null)
  const [toast, setToast]                 = useState(null)

  useEffect(() => {
    medicoService.getById(MEDICO_ID)
      .then(setMedico)
      .catch(() => setError('No se pudo cargar el perfil del médico.'))
  }, [setError])

  const cargarAgenda = useCallback(() => {
    if (!medico) return
    setLoading(true); setError(null)
    medicoService.getAgendaSemana(medico.id, toISO(semanaBase))
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo cargar la agenda.'))
      .finally(() => setLoading(false))
  }, [medico, semanaBase, setSlots, setLoading, setError])

  useEffect(() => { cargarAgenda() }, [cargarAgenda])

  const mostrarToast = (mensaje, tipo = 'ok') => setToast({ mensaje, tipo })

  async function handleConcluir(turnoId) {
    setLoadingAccion(true)
    try {
      await turnoService.patchEstado(turnoId, 'CONCLUIDA')
      actualizarEstadoTurno(turnoId, 'CONCLUIDA')
      cerrarPanel()
      mostrarToast('Cita marcada como concluida ✓')
    } catch (err) {
      mostrarToast(
        err.response?.status === 422
          ? 'El turno debe estar en CONFIRMADO para concluirse.'
          : 'No se pudo actualizar el estado.',
        'error'
      )
    } finally { setLoadingAccion(false) }
  }

  async function handleReprogramar(nuevaFecha, nuevaHora) {
    if (!citaSeleccionada) return
    setLoadingAccion(true); setErrorAccion(null)
    try {
      await turnoService.putReprogramar(citaSeleccionada.turno.id, nuevaFecha, nuevaHora)
      reprogramarTurno(citaSeleccionada.turno.id, nuevaFecha, nuevaHora)
      setModal(null)
      mostrarToast(`Cita reprogramada: ${nuevaFecha} ${nuevaHora} ↗`)
    } catch (err) {
      setErrorAccion(
        err.response?.status === 409 ? 'Ese horario ya está ocupado.'
        : err.response?.status === 422 ? 'No se puede reprogramar en su estado actual.'
        : 'No se pudo reprogramar.'
      )
    } finally { setLoadingAccion(false) }
  }

  async function handleCancelar(motivo, canales) {
    if (!citaSeleccionada) return
    setLoadingAccion(true); setErrorAccion(null)
    try {
      await turnoService.cancelarMedico(citaSeleccionada.turno.id, motivo, canales)
      liberarSlot(citaSeleccionada.turno.id)
      setModal(null)
      mostrarToast(`Cita cancelada. Notificación enviada vía ${canales.join(', ')} 🔔`)
    } catch (err) {
      setErrorAccion(
        err.response?.status === 422 ? 'No se puede cancelar con menos de 2 horas de anticipación.'
        : err.response?.status === 400 ? 'El motivo de cancelación es requerido.'
        : 'No se pudo cancelar.'
      )
    } finally { setLoadingAccion(false) }
  }

  const slotsLibresParaReprogramar = slots.filter(
    s => s.disponible && !s.bloqueado &&
      !(s.fecha === citaSeleccionada?.fecha && s.hora === citaSeleccionada?.hora)
  )

  return (
    <div style={{
      minHeight:   '100vh',
      background:  'var(--color-fondo)',
      backgroundImage: 'var(--color-fondo-gradiente)',
      fontFamily:  'var(--font-body)',
    }}>

      {/* ── Header ── */}
      <div style={{
        background:   'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-borde-suave)',
        padding:      '20px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Vista del médico</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{
                fontFamily:    'var(--font-display)',
                fontSize:      22,
                fontWeight:    400,
                color:         'var(--color-texto)',
                margin:        0,
                letterSpacing: '-0.01em',
              }}>
                {medico ? `Dr. ${medico.nombre} ${medico.apellido}` : 'Cargando...'}
              </h1>
              {medico && (
                <p style={{ fontSize: 13, color: 'var(--color-texto-suave)', marginTop: 3 }}>
                  {medico.especialidad}
                </p>
              )}
            </div>
            <div style={{
              background:   'var(--color-primario-light)',
              border:       '1px solid var(--color-borde-medio)',
              borderRadius: 'var(--radio-sm)',
              padding:      '6px 14px',
              fontSize:     12,
              color:        'var(--color-texto-suave)',
              fontFamily:   'var(--font-mono)',
            }}>
              Semana: {toISO(semanaBase)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>

        {loading && <Spinner label="Cargando agenda..." />}

        {error && !loading && (
          <BannerError mensaje={error} onReintentar={cargarAgenda} />
        )}

        {!loading && !error && medico && (
          <CalendarioMedico
            slots={slots}
            semanaBase={semanaBase}
            onSlotClick={seleccionarCita}
            onSemanaAnterior={() => {
              const d = new Date(semanaBase); d.setDate(d.getDate() - 7); setSemanaBase(d)
            }}
            onSemanaSiguiente={() => {
              const d = new Date(semanaBase); d.setDate(d.getDate() + 7); setSemanaBase(d)
            }}
          />
        )}
      </div>

      {citaSeleccionada && !modal && (
        <PanelCita
          slot={citaSeleccionada}
          onCerrar={cerrarPanel}
          onConcluir={handleConcluir}
          onReprogramar={() => setModal('reprogramar')}
          onCancelar={() => setModal('cancelar')}
          cargando={loadingAccion}
        />
      )}

      {modal === 'reprogramar' && citaSeleccionada && (
        <ModalReprogramar
          turno={{ ...citaSeleccionada.turno, fecha: citaSeleccionada.fecha, hora: citaSeleccionada.hora }}
          slotsDisponibles={slotsLibresParaReprogramar}
          onConfirmar={handleReprogramar}
          onCerrar={() => { setModal(null); setErrorAccion(null) }}
          cargando={loadingAccion}
          error={errorAccion}
        />
      )}

      {modal === 'cancelar' && citaSeleccionada && (
        <ModalCancelar
          turno={{ ...citaSeleccionada.turno, fecha: citaSeleccionada.fecha, hora: citaSeleccionada.hora }}
          onConfirmar={handleCancelar}
          onCerrar={() => { setModal(null); setErrorAccion(null) }}
          cargando={loadingAccion}
          error={errorAccion}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  )
}

// ── Componentes auxiliares compartibles ───────────────────────────────────────

export function Spinner({ label = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--color-texto-muted)', fontSize: 13 }}>
      <div style={{
        width: 18, height: 18,
        border: '2px solid var(--color-borde-suave)',
        borderTopColor: 'var(--color-primario)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {label}
    </div>
  )
}

export function BannerError({ mensaje, onReintentar }) {
  return (
    <div style={{
      padding:      '12px 16px',
      background:   'rgba(239,68,68,0.06)',
      border:       '1px solid rgba(239,68,68,0.2)',
      borderRadius: 'var(--radio-md)',
      color:        '#dc2626',
      fontSize:     13,
      display:      'flex',
      alignItems:   'center',
      gap:          12,
    }}>
      ⚠ {mensaje}
      {onReintentar && (
        <button
          onClick={onReintentar}
          style={{
            marginLeft:   'auto',
            background:   'white',
            border:       '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radio-sm)',
            color:        '#dc2626',
            fontSize:     12,
            padding:      '4px 10px',
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}