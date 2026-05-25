// ============================================================
// CalendarioPage.jsx — Luciana Sprint 2
// Flujo CU-03: especialidad → médico → CalendarioSemana
// Loading spinner entre cada paso
// Conecta con disponibilidadService (mock → real con 1 línea)
// ============================================================
import { useState, useEffect } from 'react'
import CalendarioSemana from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'
import { getDisponibilidad } from '../services/disponibilidadService'
import { mockMedicos } from '../data/mockData'
import '../components/CalendarioSemana.css'
import '../components/MedicosAlternativos.css'
import './CalendarioPage.css'

// Especialidades únicas de la lista de médicos
const especialidades = [...new Set(mockMedicos.map(m => m.especialidad))].sort()

// Paso 1: elegir especialidad
// Paso 2: elegir médico
// Paso 3: ver calendario
const PASOS = { ESPECIALIDAD: 1, MEDICO: 2, CALENDARIO: 3 }

export default function CalendarioPage() {
  const [paso, setPaso]                       = useState(PASOS.ESPECIALIDAD)
  const [especialidad, setEspecialidad]       = useState(null)
  const [medico, setMedico]                   = useState(null)
  const [semanaOffset, setSemanaOffset]       = useState(0)
  const [slots, setSlots]                     = useState([])
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)
  const [slotElegido, setSlotElegido]         = useState(null)

  // Médicos filtrados por especialidad elegida
  const medicosFiltrados = mockMedicos.filter(m => m.especialidad === especialidad)

  // Cuando cambia médico o semana → cargar slots
  useEffect(() => {
    if (!medico) return

    let cancelado = false
    setLoading(true)
    setError(null)
    setSlots([])

    getDisponibilidad(medico.id, semanaOffset)
      .then(data => {
        if (!cancelado) setSlots(data)
      })
      .catch(err => {
        if (!cancelado) setError('No se pudo cargar la disponibilidad. Intentá de nuevo.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => { cancelado = true }
  }, [medico, semanaOffset])

  // ¿Hay al menos un slot libre en los datos cargados?
  const haySlotsLibres = slots.some(s => s.disponible && !s.bloqueoActivo)

  const handleSeleccionarEspecialidad = (esp) => {
    setEspecialidad(esp)
    setMedico(null)
    setSlots([])
    setSemanaOffset(0)
    setPaso(PASOS.MEDICO)
  }

  const handleSeleccionarMedico = (m) => {
    setMedico(m)
    setSlots([])
    setSemanaOffset(0)
    setPaso(PASOS.CALENDARIO)
  }

  const handleVolver = () => {
    if (paso === PASOS.MEDICO)    { setPaso(PASOS.ESPECIALIDAD); setEspecialidad(null) }
    if (paso === PASOS.CALENDARIO){ setPaso(PASOS.MEDICO); setMedico(null); setSlots([]) }
  }

  return (
    <div className="cal-page">

      {/* Breadcrumb de pasos */}
      <div className="cal-steps">
        <span className={`step ${paso >= 1 ? 'step--active' : ''}`}>1. Especialidad</span>
        <span className="step-sep">›</span>
        <span className={`step ${paso >= 2 ? 'step--active' : ''}`}>2. Médico</span>
        <span className="step-sep">›</span>
        <span className={`step ${paso >= 3 ? 'step--active' : ''}`}>3. Disponibilidad</span>
      </div>

      {/* Botón volver */}
      {paso > 1 && (
        <button className="cal-volver" onClick={handleVolver}>
          ← Volver
        </button>
      )}

      {/* ── PASO 1: ELEGIR ESPECIALIDAD ── */}
      {paso === PASOS.ESPECIALIDAD && (
        <div className="cal-seccion">
          <h2 className="cal-page-title">¿Qué especialidad buscás?</h2>
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
        </div>
      )}

      {/* ── PASO 2: ELEGIR MÉDICO ── */}
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

      {/* ── PASO 3: CALENDARIO ── */}
      {paso === PASOS.CALENDARIO && (
        <div className="cal-seccion">
          <div className="medico-badge">
            <span className="mb-nombre">Dr/a. {medico.nombre} {medico.apellido}</span>
            <span className="mb-esp">{medico.especialidad}</span>
          </div>

          {/* Spinner de carga */}
          {loading && (
            <div className="cal-spinner-wrap" aria-live="polite" aria-label="Cargando disponibilidad">
              <div className="cal-spinner" />
              <span className="cal-spinner-txt">Cargando disponibilidad...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="cal-error" role="alert">
              {error}
              <button className="cal-retry" onClick={() => setSemanaOffset(o => o)}>
                Reintentar
              </button>
            </div>
          )}

          {/* Calendario — solo cuando hay datos y no está cargando */}
          {!loading && !error && (
            <>
              {/* Navegación de semana CONTROLADA acá para re-fetch */}
              <div className="cal-nav">
                <button className="cal-btn" onClick={() => setSemanaOffset(o => o - 1)}>
                  ← Anterior
                </button>
                <span className="cal-semana-label">Semana {semanaOffset === 0 ? 'actual' : semanaOffset > 0 ? `+${semanaOffset}` : semanaOffset}</span>
                <button className="cal-btn" onClick={() => setSemanaOffset(o => o + 1)}>
                  Siguiente →
                </button>
              </div>

              {/* Sin disponibilidad → mostrar alternativos */}
              {slots.length > 0 && !haySlotsLibres && (
                <MedicosAlternativos
                  especialidad={especialidad}
                  medicos={mockMedicos.filter(m => m.id !== medico.id)}
                  onSeleccionar={handleSeleccionarMedico}
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

      {/* Modal confirmación slot */}
      {slotElegido && (
        <div
          className="modal-backdrop"
          onClick={() => setSlotElegido(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">¿Confirmar selección?</h3>
            <div className="modal-info">
              <div className="modal-row">
                <span className="modal-lbl">Médico</span>
                <span>Dr/a. {medico.nombre} {medico.apellido}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Especialidad</span>
                <span>{medico.especialidad}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Fecha</span>
                <span>{slotElegido.fecha}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Hora</span>
                <span>{slotElegido.hora}</span>
              </div>
            </div>
            <p className="modal-note">Sprint 3: este botón llamará a POST /api/turnos/solicitar</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={() => setSlotElegido(null)}>Cancelar</button>
              <button
                className="modal-btn modal-btn--confirm"
                onClick={() => {
                  alert(`Turno pre-seleccionado: ${slotElegido.fecha} ${slotElegido.hora}`)
                  setSlotElegido(null)
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}