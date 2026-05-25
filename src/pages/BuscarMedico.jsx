// src/pages/BuscarMedico.jsx
import { useState, useEffect } from 'react'
import { medicos, especialidades } from '../mocks/mockData'
import { disponibilidadService } from '../services/disponibilidadService'
import SelectorEspecialidad from '../components/SelectorEspecialidad'
import ListaMedicos from '../components/ListaMedicos'
import CalendarioSemana from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'
import ModalTurno from '../components/ModalTurno'

function getLunes(fecha) {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

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

  // Sprint 3: slot seleccionado para el modal
  const [slotModal, setSlotModal] = useState(null)

  const medicosFiltrados = especialidadSeleccionada === 'Todas'
    ? medicos
    : medicos.filter(m => m.especialidad === especialidadSeleccionada)

  const medicosEspecialidad = medicoSeleccionado
    ? medicos.filter(m => m.especialidad === medicoSeleccionado.especialidad)
    : []

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
          setErrorSlots('sin-agenda')
        } else {
          setErrorSlots('error-red')
        }
      })
      .finally(() => setCargandoSlots(false))

  }, [medicoSeleccionado, semanaBase])

  function handleVerDisponibilidad(medico) {
    setMedicoSeleccionado(medico)
    setSemanaBase(getLunes(new Date()))
    setSlotModal(null)
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

  // Sprint 3: abrir modal al clickear un slot libre
  function handleSlotClick(slot) {
    setSlotModal(slot)
  }

  const semanaFin = new Date(semanaBase)
  semanaFin.setDate(semanaFin.getDate() + 6)

  const labelSemana = `${semanaBase.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${semanaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`

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

      <SelectorEspecialidad
        especialidades={especialidades}
        seleccionada={especialidadSeleccionada}
        onCambio={(esp) => {
          setEspecialidadSeleccionada(esp)
          setMedicoSeleccionado(null)
          setSlots([])
          setErrorSlots('')
          setSlotModal(null)
        }}
      />

      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
        {medicosFiltrados.length} médico{medicosFiltrados.length !== 1 ? 's' : ''} encontrado{medicosFiltrados.length !== 1 ? 's' : ''}
      </p>

      <ListaMedicos
        medicos={medicosFiltrados}
        onVerDisponibilidad={handleVerDisponibilidad}
      />

      {medicoSeleccionado && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Disponibilidad — Dr/a. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            {medicoSeleccionado.especialidad}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <button onClick={handleSemanaAnterior} style={btnNavSemana}>← Anterior</button>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>{labelSemana}</span>
            <button onClick={handleSemanaSiguiente} style={btnNavSemana}>Siguiente →</button>
          </div>

          {cargandoSlots && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
              <div style={{
                display: 'inline-block', width: '28px', height: '28px',
                border: '3px solid #e2e8f0', borderTopColor: '#2563eb',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Cargando disponibilidad...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!cargandoSlots && errorRed && (
            <div style={estiloError}>
              ⚠ No se pudo cargar la disponibilidad. Verificá tu conexión e intentá de nuevo.
            </div>
          )}

          {!cargandoSlots && sinAgenda && (
            <div style={estiloInfo}>
              📋 Este médico todavía no tiene agenda configurada.
            </div>
          )}

          {!cargandoSlots && !errorSlots && !haySlots && (
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ⚠ Sin disponibilidad esta semana.
            </p>
          )}

          {!cargandoSlots && haySlots && (
            <CalendarioSemana slots={slots} onSlotClick={handleSlotClick} />
          )}

          {!cargandoSlots && (sinAgenda || !haySlots) && (
            <MedicosAlternativos
              medicos={medicosEspecialidad}
              medicoActualId={medicoSeleccionado.id}
              onVerDisponibilidad={handleVerDisponibilidad}
            />
          )}
        </div>
      )}

      {/* Modal Sprint 3 */}
      {slotModal && medicoSeleccionado && (
        <ModalTurno
          slot={slotModal}
          medico={medicoSeleccionado}
          onCerrar={() => setSlotModal(null)}
        />
      )}
    </div>
  )
}

const btnNavSemana = {
  padding: '0.35rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

const estiloError = {
  padding: '1rem',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '10px',
  color: '#dc2626',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
}

const estiloInfo = {
  padding: '1rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  color: '#64748b',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
}

export default BuscarMedico