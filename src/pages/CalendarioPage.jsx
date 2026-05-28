// src/pages/CalendarioPage.jsx
// ============================================================
// Sprint 3 — feature/luci-s3-mis-turnos
// Cambio respecto a S2: el placeholder del slot se reemplaza
// por el ModalTurno de Adri (feature/adri-s3-modal-turno)
// que maneja el flujo completo CU-01: bloqueo 5min → confirmar
// ============================================================
import { useState, useEffect } from 'react'
import CalendarioSemana    from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'
import ModalTurno          from '../components/ModalTurno'         // ← de Adri
import { disponibilidadService } from '../services/disponibilidadService'
import { medicoService }         from '../services/medicoService'
import '../components/CalendarioSemana.css'
import './CalendarioPage.css'

const PASOS = { ESPECIALIDAD: 1, MEDICO: 2, CALENDARIO: 3 }

export default function CalendarioPage() {
  const [paso, setPaso]               = useState(PASOS.ESPECIALIDAD)
  const [especialidad, setEspecialidad] = useState(null)
  const [medico, setMedico]           = useState(null)
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [slots, setSlots]             = useState([])
  const [slotElegido, setSlotElegido] = useState(null)   // abre ModalTurno

  const [medicos, setMedicos]               = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(false)
  const [errorMedicos, setErrorMedicos]     = useState(null)

  const [loadingSlots, setLoadingSlots] = useState(false)
  const [errorSlots, setErrorSlots]     = useState(null)

  // Cargar médicos por especialidad
  useEffect(() => {
    if (!especialidad) return
    let cancelado = false
    setLoadingMedicos(true); setErrorMedicos(null); setMedicos([])

    medicoService.getByEspecialidad(especialidad)
      .then(data => { if (!cancelado) setMedicos(data) })
      .catch(() => { if (!cancelado) setErrorMedicos('No se pudieron cargar los médicos. Intentá de nuevo.') })
      .finally(() => { if (!cancelado) setLoadingMedicos(false) })

    return () => { cancelado = true }
  }, [especialidad])

  // Cargar slots del médico
  useEffect(() => {
    if (!medico) return
    let cancelado = false
    setLoadingSlots(true); setErrorSlots(null); setSlots([])

    disponibilidadService.getSlots(medico.id, semanaOffset)
      .then(data => { if (!cancelado) setSlots(data) })
      .catch(() => { if (!cancelado) setErrorSlots('No se pudo cargar la disponibilidad. Intentá de nuevo.') })
      .finally(() => { if (!cancelado) setLoadingSlots(false) })

    return () => { cancelado = true }
  }, [medico, semanaOffset])

  const haySlotsLibres = slots.some(s => s.disponible && !s.bloqueoActivo)

  function handleSeleccionarEspecialidad(esp) {
    setEspecialidad(esp); setMedico(null); setSlots([]); setSemanaOffset(0)
    setPaso(PASOS.MEDICO)
  }
  function handleSeleccionarMedico(m) {
    setMedico(m); setSlots([]); setSemanaOffset(0)
    setPaso(PASOS.CALENDARIO)
  }
  function handleVolver() {
    if (paso === PASOS.MEDICO)     { setPaso(PASOS.ESPECIALIDAD); setEspecialidad(null); setMedicos([]) }
    if (paso === PASOS.CALENDARIO) { setPaso(PASOS.MEDICO); setMedico(null); setSlots([]) }
  }

  const especialidades = [
    'Cardiología', 'Pediatría', 'Traumatología',
    'Dermatología', 'Clínica General', 'Ginecología',
  ]

  return (
    <div className="cal-page">

      {/* Breadcrumb */}
      <div className="cal-steps">
        <span className={`step ${paso >= 1 ? 'step--active' : ''}`}>1. Especialidad</span>
        <span className="step-sep">›</span>
        <span className={`step ${paso >= 2 ? 'step--active' : ''}`}>2. Médico</span>
        <span className="step-sep">›</span>
        <span className={`step ${paso >= 3 ? 'step--active' : ''}`}>3. Disponibilidad</span>
      </div>

      {paso > 1 && (
        <button className="cal-volver" onClick={handleVolver}>← Volver</button>
      )}

      {/* PASO 1 */}
      {paso === PASOS.ESPECIALIDAD && (
        <div className="cal-seccion">
          <h2 className="cal-page-title">¿Qué especialidad buscás?</h2>
          <div className="esp-grid">
            {especialidades.map(esp => (
              <button key={esp} className="esp-card"
                onClick={() => handleSeleccionarEspecialidad(esp)}
                aria-label={`Especialidad ${esp}`}
              >{esp}</button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2 */}
      {paso === PASOS.MEDICO && (
        <div className="cal-seccion">
          <h2 className="cal-page-title">Médicos de {especialidad}</h2>

          {loadingMedicos && (
            <div className="cal-spinner-wrap" aria-live="polite">
              <div className="cal-spinner" />
              <span className="cal-spinner-txt">Cargando médicos…</span>
            </div>
          )}
          {errorMedicos && !loadingMedicos && (
            <div className="cal-error" role="alert">{errorMedicos}</div>
          )}
          {!loadingMedicos && !errorMedicos && medicos.length === 0 && (
            <p className="cal-sin-datos">No hay médicos disponibles en esta especialidad.</p>
          )}
          {!loadingMedicos && !errorMedicos && medicos.length > 0 && (
            <div className="medico-lista">
              {medicos.map(m => (
                <button key={m.id} className="medico-card"
                  onClick={() => handleSeleccionarMedico(m)}
                  aria-label={`Seleccionar Dr/a ${m.nombre} ${m.apellido}`}
                >
                  <span className="mc-nombre">Dr/a. {m.nombre} {m.apellido}</span>
                  <span className="mc-esp">{m.especialidad}</span>
                  <span className="mc-ver">Ver disponibilidad →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASO 3 */}
      {paso === PASOS.CALENDARIO && (
        <div className="cal-seccion">
          <div className="medico-badge">
            <span className="mb-nombre">Dr/a. {medico.nombre} {medico.apellido}</span>
            <span className="mb-esp">{medico.especialidad}</span>
          </div>

          <div className="cal-nav">
            <button className="cal-btn" onClick={() => setSemanaOffset(o => o - 1)}
              aria-label="Semana anterior">← Anterior</button>
            <span className="cal-semana-label">
              {semanaOffset === 0 ? 'Semana actual'
                : semanaOffset > 0 ? `+${semanaOffset} semana${semanaOffset > 1 ? 's' : ''}`
                : `${semanaOffset} semana${semanaOffset < -1 ? 's' : ''}`}
            </span>
            <button className="cal-btn" onClick={() => setSemanaOffset(o => o + 1)}
              disabled={semanaOffset >= 3} aria-label="Semana siguiente">Siguiente →</button>
          </div>

          {loadingSlots && (
            <div className="cal-spinner-wrap" aria-live="polite">
              <div className="cal-spinner" />
              <span className="cal-spinner-txt">Cargando disponibilidad…</span>
            </div>
          )}
          {errorSlots && !loadingSlots && (
            <div className="cal-error" role="alert">
              {errorSlots}
              <button className="cal-retry" onClick={() => setSemanaOffset(o => o)}>Reintentar</button>
            </div>
          )}

          {!loadingSlots && !errorSlots && (
            <>
              {slots.length === 0 && (
                <div className="cal-sin-datos">Sin disponibilidad este período.</div>
              )}
              {slots.length > 0 && !haySlotsLibres && (
                <MedicosAlternativos
                  medicos={medicos.filter(m => m.id !== medico.id)}
                  medicoActualId={medico.id}
                  onVerDisponibilidad={handleSeleccionarMedico}
                />
              )}
              {slots.length > 0 && (
                <CalendarioSemana
                  slots={slots}
                  onSlotClick={setSlotElegido}   // ← abre ModalTurno de Adri
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ── ModalTurno de Adri: se abre al clickear un slot libre (CU-01) ── */}
      {slotElegido && medico && (
        <ModalTurno
          slot={slotElegido}
          medico={medico}
          onCerrar={() => setSlotElegido(null)}
        />
      )}
    </div>
  )
}