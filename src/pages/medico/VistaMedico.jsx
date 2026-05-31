// src/pages/medico/VistaMedico.jsx
// Lee el medicoId de sessionStorage['sesion'] en vez de hardcodearlo.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate }       from 'react-router-dom'
import { useMedicoStore }    from '../../store/medicoStore'
import { useModal }          from '../../hooks/useModal'
import CalendarioMedico      from '../../components/medico/CalendarioMedico'
import PanelCita             from '../../components/medico/PanelCita'
import ModalReprogramar      from '../../components/medico/ModalReprogramar'
import ModalCancelar         from '../../components/medico/ModalCancelar'
import Toast                 from '../../components/medico/Toast'
import { medicoService }     from '../../services/medicoService'
import { turnoService }      from '../../services/turnoService'
import { getLunes, toISO } from '../../utils/fecha'
import { Spinner, BannerError } from '../../components/medico/Spinner'
import { personalStore } from '../../store/personalStore'

export default function VistaMedico() {
  const navigate = useNavigate()
  const {
    slots, setSlots, loading, setLoading, error, setError,
    citaSeleccionada, seleccionarCita, cerrarPanel,
    actualizarEstadoTurno, liberarSlot, reprogramarTurno,
  } = useMedicoStore()

  const medicoId = personalStore.getMedicoId()

  const [medico, setMedico]               = useState(null)
  const [semanaBase, setSemanaBase] = useState(() => getLunes())
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [toast, setToast]                 = useState(null)

  const { modal, abrirModal, cerrarModal, esModal, errorAccion, setErrorAccion } = useModal()

  // Guardia: si no hay sesión de médico, redirigir
  useEffect(() => {
    if (!medicoId) { navigate('/login', { replace: true }); return }
    medicoService.getById(medicoId)
      .then(setMedico)
      .catch(() => setError('No se pudo cargar el perfil del médico.'))
  }, [medicoId, navigate, setError])

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
      cerrarModal()
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
      cerrarModal()
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
      minHeight:  '100vh',
      background: 'var(--color-fondo)',
      backgroundImage: 'var(--color-fondo-gradiente)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Header ── */}
      <div style={{
        background:     'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom:   '1px solid var(--color-borde-suave)',
        padding:        '20px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Vista del médico</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22, fontWeight: 400,
                color: 'var(--color-texto)', margin: 0, letterSpacing: '-0.01em',
              }}>
                {medico ? `Dr. ${medico.nombre} ${medico.apellido}` : 'Cargando...'}
              </h1>
              {medico && (
                <p style={{ fontSize:13, color:'var(--color-texto-suave)', marginTop:3 }}>
                  {medico.especialidad}
                </p>
              )}
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
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
              <button
                onClick={() => navigate('/agenda')}
                className="btn btn--outline"
                style={{ fontSize:12, padding:'6px 14px' }}
              >
                Gestionar agenda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 48px' }}>

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
          onReprogramar={() => abrirModal('reprogramar')}
          onCancelar={() => abrirModal('cancelar')}
          cargando={loadingAccion}
        />
      )}

      {esModal('reprogramar') && citaSeleccionada && (
        <ModalReprogramar
          turno={{ ...citaSeleccionada.turno, fecha: citaSeleccionada.fecha, hora: citaSeleccionada.hora }}
          slotsDisponibles={slotsLibresParaReprogramar}
          onConfirmar={handleReprogramar}
          onCerrar={cerrarModal}
          cargando={loadingAccion}
          error={errorAccion}
        />
      )}

      {esModal('cancelar') && citaSeleccionada && (
        <ModalCancelar
          turno={{ ...citaSeleccionada.turno, fecha: citaSeleccionada.fecha, hora: citaSeleccionada.hora }}
          onConfirmar={handleCancelar}
          onCerrar={cerrarModal}
          cargando={loadingAccion}
          error={errorAccion}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  )
}
