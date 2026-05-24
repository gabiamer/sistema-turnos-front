// src/pages/BuscarMedico.jsx
import { useState, useEffect } from 'react'
import { medicos, especialidades } from '../mocks/mockData'
import { disponibilidadService } from '../services/disponibilidadService'
import SelectorEspecialidad from '../components/SelectorEspecialidad'
import ListaMedicos from '../components/ListaMedicos'
import CalendarioSemana from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'

// Devuelve el lunes de la semana a la que pertenece una fecha
function getLunes(fecha) {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Formatea Date a 'YYYY-MM-DD'
function toISO(fecha) {
  return fecha.toISOString().slice(0, 10)
}

function BuscarMedico() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('Todas')
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null)
  const [semanaBase, setSemanaBase] = useState(() => getLunes(new Date()))

  const [slots, setSlots] = useState([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [errorSlots, setErrorSlots] = useState('')

  const medicosFiltrados = especialidadSeleccionada === 'Todas'
    ? medicos
    : medicos.filter(m => m.especialidad === especialidadSeleccionada)

  // Médicos de la misma especialidad (para MedicosAlternativos)
  const medicosEspecialidad = medicoSeleccionado
    ? medicos.filter(m => m.especialidad === medicoSeleccionado.especialidad)
    : []

  // Cada vez que cambia el médico o la semana → pedir slots al back
  useEffect(() => {
    if (!medicoSeleccionado) return

    setCargandoSlots(true)
    setErrorSlots('')
    setSlots([])

    disponibilidadService
      .getSlots(medicoSeleccionado.id, toISO(semanaBase))
      .then(data => setSlots(data))
      .catch(err => {
        if (err.response?.status === 404) {
          setErrorSlots('sin-agenda') // médico sin agenda configurada
        } else {
          setErrorSlots('error-red')
        }
      })
      .finally(() => setCargandoSlots(false))

  }, [medicoSeleccionado, semanaBase])

  function handleVerDisponibilidad(medico) {
    setMedicoSeleccionado(medico)
    setSemanaBase(getLunes(new Date())) // resetear a semana actual
  }

  function handleSemanaAnterior() {
    setSemanaBase(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  function handleSemanaSiguiente() {
    setSemanaBase(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  function handleSlotClick(slot) {
    alert(`Seleccionaste el slot:\n📅 ${slot.fecha}  🕐 ${slot.hora}\nMédico: ${medicoSeleccionado.nombre} ${medicoSeleccionado.apellido}`)
    // En Sprint 3 esto abrirá el modal de confirmación
  }

  const semanaFin = new Date(semanaBase)
  semanaFin.setDate(semanaFin.getDate() + 6)

  const labelSemana = `${semanaBase.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${semanaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`

  // Hay slots libres esta semana?
  const haySlots = slots.length > 0
  const sinAgenda = errorSlots === 'sin-agenda'
  const errorRed = errorSlots === 'error-red'

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Buscar Médico
      </h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Elegí una especialidad, seleccioná un médico y reservá tu turno.
      </p>

      {/* Paso 1: filtro especialidad */}
      <SelectorEspecialidad
        especialidades={especialidades}
        seleccionada={especialidadSeleccionada}
        onCambio={(esp) => {
          setEspecialidadSeleccionada(esp)
          setMedicoSeleccionado(null)
          setSlots([])
          setErrorSlots('')
        }}
      />

      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
        {medicosFiltrados.length} médico{medicosFiltrados.length !== 1 ? 's' : ''} encontrado{medicosFiltrados.length !== 1 ? 's' : ''}
      </p>

      {/* Paso 2: lista médicos */}
      <ListaMedicos
        medicos={medicosFiltrados}
        onVerDisponibilidad={handleVerDisponibilidad}
      />

      {/* Paso 3: calendario */}
      {medicoSeleccionado && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Disponibilidad — Dr/a. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            {medicoSeleccionado.especialidad}
          </p>

          {/* Navegación de semana */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <button
              onClick={handleSemanaAnterior}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Anterior
            </button>

            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>
              {labelSemana}
            </span>

            <button
              onClick={handleSemanaSiguiente}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Siguiente →
            </button>
          </div>

          {/* Spinner */}
          {cargandoSlots && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
              <div style={{
                display: 'inline-block',
                width: '28px', height: '28px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Cargando disponibilidad...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error de red */}
          {!cargandoSlots && errorRed && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}>
              ⚠ No se pudo cargar la disponibilidad. Verificá tu conexión e intentá de nuevo.
            </div>
          )}

          {/* Médico sin agenda configurada */}
          {!cargandoSlots && sinAgenda && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}>
              📋 Este médico todavía no tiene agenda configurada.
            </div>
          )}

          {/* Sin slots esta semana */}
          {!cargandoSlots && !errorSlots && !haySlots && (
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ⚠ Sin disponibilidad esta semana.
            </p>
          )}

          {/* Calendario con slots */}
          {!cargandoSlots && haySlots && (
            <CalendarioSemana slots={slots} onSlotClick={handleSlotClick} />
          )}

          {/* Médicos alternativos: aparece cuando no hay slots (sin agenda o semana vacía) */}
          {!cargandoSlots && (sinAgenda || !haySlots) && (
            <MedicosAlternativos
              medicos={medicosEspecialidad}
              medicoActualId={medicoSeleccionado.id}
              onVerDisponibilidad={handleVerDisponibilidad}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default BuscarMedico