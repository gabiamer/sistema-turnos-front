// src/pages/medico/VistaMedico.jsx
// Conectado 100% al backend real:
//   - GET  /api/medicos/{id}/agenda-semana   → grilla con datos de pacientes
//   - PATCH /api/turnos/{id}/estado          → marcar CONCLUIDA
//   - PUT   /api/turnos/{id}/reprogramar     → nueva fecha/hora
//   - DELETE /api/turnos/{id}                → cancelar con motivo + canales

import { useState, useEffect, useCallback } from 'react'
import { useMedicoStore } from '../../store/medicoStore'
import CalendarioMedico   from '../../components/medico/CalendarioMedico'
import PanelCita          from '../../components/medico/PanelCita'
import ModalReprogramar   from '../../components/medico/ModalReprogramar'
import ModalCancelar      from '../../components/medico/ModalCancelar'
import Toast              from '../../components/medico/Toast'
import { medicoService }  from '../../services/medicoService'
import { turnoService }   from '../../services/turnoService'

// ID del médico logueado — en una app real vendría del contexto de autenticación.
// Por ahora se hardcodea 1 (primer médico del DataSeeder).
const MEDICO_ID = 1

function getLunesActual() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff)
  hoy.setHours(0, 0, 0, 0)
  return hoy
}

function toISO(fecha) {
  return fecha.toISOString().split('T')[0]
}

export default function VistaMedico() {
  const {
    slots, setSlots, loading, setLoading, error, setError,
    citaSeleccionada, seleccionarCita, cerrarPanel,
    actualizarEstadoTurno, liberarSlot, reprogramarTurno,
  } = useMedicoStore()

  const [medico, setMedico]               = useState(null)
  const [semanaBase, setSemanaBase]       = useState(getLunesActual)
  const [modal, setModal]                 = useState(null)   // 'reprogramar' | 'cancelar'
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [errorAccion, setErrorAccion]     = useState(null)
  const [toast, setToast]                 = useState(null)

  // Cargar perfil del médico
  useEffect(() => {
    medicoService.getById(MEDICO_ID)
      .then(setMedico)
      .catch(() => setError('No se pudo cargar el perfil del médico.'))
  }, [setError])

  // Cargar agenda semanal enriquecida
  const cargarAgenda = useCallback(() => {
    if (!medico) return
    setLoading(true); setError(null)
    medicoService.getAgendaSemana(medico.id, toISO(semanaBase))
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo cargar la agenda.'))
      .finally(() => setLoading(false))
  }, [medico, semanaBase, setSlots, setLoading, setError])

  useEffect(() => { cargarAgenda() }, [cargarAgenda])

  function mostrarToast(mensaje, tipo = 'ok') { setToast({ mensaje, tipo }) }

  // ── Concluir ──────────────────────────────────────────────────────────────
  async function handleConcluir(turnoId) {
    setLoadingAccion(true)
    try {
      await turnoService.patchEstado(turnoId, 'CONCLUIDA')
      actualizarEstadoTurno(turnoId, 'CONCLUIDA')
      cerrarPanel()
      mostrarToast('Cita marcada como concluida ✓')
    } catch (err) {
      const msg = err.response?.status === 422
        ? 'El turno debe estar en CONFIRMADO para concluirse.'
        : 'No se pudo actualizar el estado.'
      mostrarToast(msg, 'error')
    } finally { setLoadingAccion(false) }
  }

  // ── Reprogramar ───────────────────────────────────────────────────────────
  async function handleReprogramar(nuevaFecha, nuevaHora) {
    if (!citaSeleccionada) return
    setLoadingAccion(true); setErrorAccion(null)
    try {
      await turnoService.putReprogramar(citaSeleccionada.turno.id, nuevaFecha, nuevaHora)
      reprogramarTurno(citaSeleccionada.turno.id, nuevaFecha, nuevaHora)
      setModal(null)
      mostrarToast(`Cita reprogramada: ${nuevaFecha} ${nuevaHora} ↗`)
    } catch (err) {
      const msg = err.response?.status === 409
        ? 'Ese horario ya está ocupado.'
        : err.response?.status === 422
          ? 'No se puede reprogramar este turno en su estado actual.'
          : 'No se pudo reprogramar.'
      setErrorAccion(msg)
    } finally { setLoadingAccion(false) }
  }

  // ── Cancelar ──────────────────────────────────────────────────────────────
  async function handleCancelar(motivo, canales) {
    if (!citaSeleccionada) return
    setLoadingAccion(true); setErrorAccion(null)
    try {
      await turnoService.cancelarMedico(citaSeleccionada.turno.id, motivo, canales)
      liberarSlot(citaSeleccionada.turno.id)
      setModal(null)
      mostrarToast(`Cita cancelada. Notificación enviada vía ${canales.join(', ')} 🔔`)
    } catch (err) {
      const msg = err.response?.status === 422
        ? 'No se puede cancelar con menos de 2 horas de anticipación.'
        : err.response?.status === 400
          ? 'El motivo de cancelación es requerido.'
          : 'No se pudo cancelar.'
      setErrorAccion(msg)
    } finally { setLoadingAccion(false) }
  }

  const slotsLibresParaReprogramar = slots.filter(
    s => s.disponible && !s.bloqueado &&
      !(s.fecha === citaSeleccionada?.fecha && s.hora === citaSeleccionada?.hora)
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Vista del médico
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {medico ? `Dr. ${medico.nombre} ${medico.apellido}` : 'Cargando...'}
              </h1>
              {medico && <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{medico.especialidad}</p>}
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
              Semana: {toISO(semanaBase)}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>

        {loading && <CargandoIndicador />}

        {error && !loading && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            ⚠ {error}
            <button onClick={cargarAgenda} style={{ marginLeft: 'auto', background: 'white', border: '1px solid #fca5a5', borderRadius: 6, color: '#dc2626', fontSize: 12, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && medico && (
          <CalendarioMedico
            slots={slots}
            semanaBase={semanaBase}
            onSlotClick={seleccionarCita}
            onSemanaAnterior={() => { const d = new Date(semanaBase); d.setDate(d.getDate() - 7); setSemanaBase(d) }}
            onSemanaSiguiente={() => { const d = new Date(semanaBase); d.setDate(d.getDate() + 7); setSemanaBase(d) }}
          />
        )}
      </div>

      {/* Panel lateral */}
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

      {/* Modal reprogramar */}
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

      {/* Modal cancelar */}
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

function CargandoIndicador() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#64748b', fontSize: 13 }}>
      <div style={{ width: 18, height: 18, border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      Cargando agenda...
    </div>
  )
}