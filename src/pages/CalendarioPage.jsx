// src/pages/CalendarioPage.jsx
// Flujo CU-03: especialidad → médico → CalendarioSemana
import { useState, useEffect } from 'react'
import CalendarioSemana from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'
import ModalTurno from '../components/ModalTurno'
import { disponibilidadService } from '../services/disponibilidadService'
import { medicoService } from '../services/medicoService'
import '../components/CalendarioSemana.css'
import './CalendarioPage.css'

const PASOS = { ESPECIALIDAD: 1, MEDICO: 2, CALENDARIO: 3 }

export default function CalendarioPage() {
  const [paso, setPaso]                   = useState(PASOS.ESPECIALIDAD)
  const [medicos, setMedicos]             = useState([])
  const [cargandoMedicos, setCargando]    = useState(true)
  const [especialidades, setEspecialidades] = useState([])
  const [especialidad, setEspecialidad]   = useState(null)
  const [medico, setMedico]               = useState(null)
  const [semanaOffset, setSemanaOffset]   = useState(0)
  const [slots, setSlots]                 = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [slotElegido, setSlotElegido]     = useState(null)

  // Cargar médicos reales al montar
  useEffect(() => {
    medicoService.getAll()
      .then(data => {
        setMedicos(data)
        const esp = [...new Set(data.map(m => m.especialidad))].sort()
        setEspecialidades(esp)
      })
      .catch(err => console.error('Error cargando médicos:', err))
      .finally(() => setCargando(false))
  }, [])

  const medicosFiltrados = medicos.filter(m => m.especialidad === especialidad)

  useEffect(() => {
    if (!medico) return
    let cancelado = false
    setLoading(true); setError(null); setSlots([])

    disponibilidadService.getSlots(medico.id, semanaOffset)
      .then(data => { if (!cancelado) setSlots(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelado) setError('No se pudo cargar la disponibilidad. Intenta de nuevo.') })
      .finally(() => { if (!cancelado) setLoading(false) })

    return () => { cancelado = true }
  }, [medico, semanaOffset])

  const haySlotsLibres = slots.some(s => s.disponible && !s.bloqueado)

  const handleSeleccionarEspecialidad = (esp) => {
    setEspecialidad(esp)
    setMedico(null); setSlots([]); setSemanaOffset(0)
    setPaso(PASOS.MEDICO)
  }

  const handleSeleccionarMedico = (m) => {
    setMedico(m); setSlots([]); setSemanaOffset(0)
    setPaso(PASOS.CALENDARIO)
  }

  const handleVolver = () => {
    if (paso === PASOS.MEDICO)     { setPaso(PASOS.ESPECIALIDAD); setEspecialidad(null) }
    if (paso === PASOS.CALENDARIO) { setPaso(PASOS.MEDICO); setMedico(null); setSlots([]) }
  }

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

      {/* PASO 1: ESPECIALIDAD */}
      {paso === PASOS.ESPECIALIDAD && (
        <div className="cal-seccion">
          <h2 className="cal-page-title">¿Qué especialidad buscas?</h2>
          {cargandoMedicos ? (
            <div className="cal-spinner-wrap">
              <div className="cal-spinner" />
              <span className="cal-spinner-txt">Cargando especialidades...</span>
            </div>
          ) : (
            <div className="esp-grid">
              {especialidades.map(esp => (
                <button
                  key={esp}
                  className="esp-card"
                  onClick={() => handleSeleccionarEspecialidad(esp)}
                  aria-label={`Especialidad ${esp}`}
                >
                  {esp}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASO 2: MÉDICO */}
      {paso === PASOS.MEDICO && (
        <div className="cal-seccion">
          <h2 className="cal-page-title">Médicos de {especialidad}</h2>
          {medicosFiltrados.length === 0 ? (
            <p className="cal-sin-datos">No hay médicos disponibles en esta especialidad.</p>
          ) : (
            <div className="medico-lista">
              {medicosFiltrados.map(m => (
                <button
                  key={m.id}
                  className="medico-card"
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

      {/* PASO 3: CALENDARIO */}
      {paso === PASOS.CALENDARIO && (
        <div className="cal-seccion">
          <div className="medico-badge">
            <span className="mb-nombre">Dr/a. {medico.nombre} {medico.apellido}</span>
            <span className="mb-esp">{medico.especialidad}</span>
          </div>

          {loading && (
            <div className="cal-spinner-wrap" aria-live="polite">
              <div className="cal-spinner" />
              <span className="cal-spinner-txt">Cargando disponibilidad...</span>
            </div>
          )}

          {error && !loading && (
            <div className="cal-error" role="alert">
              {error}
              <button className="cal-retry" onClick={() => setSemanaOffset(o => o)}>
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="cal-nav">
                <button
                  className="cal-btn"
                  onClick={() => setSemanaOffset(o => o - 1)}
                  disabled={semanaOffset <= 0}
                  style={{ opacity: semanaOffset <= 0 ? 0.4 : 1, cursor: semanaOffset <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  ← Anterior
                </button>
                <span className="cal-semana-label">
                  Semana {semanaOffset === 0 ? 'actual' : semanaOffset > 0 ? `+${semanaOffset}` : semanaOffset}
                </span>
                <button className="cal-btn" onClick={() => setSemanaOffset(o => o + 1)}>
                  Siguiente →
                </button>
              </div>

              {slots.length > 0 && !haySlotsLibres && (
                <MedicosAlternativos
                  medicos={medicos.filter(m => m.especialidad === medico.especialidad && m.id !== medico.id)}
                  medicoActualId={medico.id}
                  onVerDisponibilidad={handleSeleccionarMedico}
                />
              )}

              {slots.length === 0 && (
                <div className="cal-sin-datos">Sin disponibilidad este período.</div>
              )}

              {slots.length > 0 && (
                <CalendarioSemana
                  slots={slots}
                  onSlotClick={setSlotElegido}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de turno */}
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