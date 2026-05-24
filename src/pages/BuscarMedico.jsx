// src/pages/BuscarMedico.jsx
import { useState } from 'react'
import { medicos, especialidades, slots } from '../mocks/mockData'
import SelectorEspecialidad from '../components/SelectorEspecialidad'
import ListaMedicos from '../components/ListaMedicos'
import CalendarioSemana from '../components/CalendarioSemana'

// Devuelve el lunes de la semana a la que pertenece una fecha
function getLunes(fecha) {
  const d = new Date(fecha)
  const dia = d.getDay() // 0=dom, 1=lun...
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
  const [cargando, setCargando] = useState(false)
  const [semanaBase, setSemanaBase] = useState(() => getLunes(new Date()))

  const medicosFiltrados = especialidadSeleccionada === 'Todas'
    ? medicos
    : medicos.filter(m => m.especialidad === especialidadSeleccionada)

  function handleVerDisponibilidad(medico) {
    setCargando(true)
    setMedicoSeleccionado(null)
    setSemanaBase(getLunes(new Date())) // resetear a semana actual al cambiar médico
    setTimeout(() => {
      setMedicoSeleccionado(medico)
      setCargando(false)
    }, 700)
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

  // Calcular el domingo de la semana visible
  const semanaFin = new Date(semanaBase)
  semanaFin.setDate(semanaFin.getDate() + 6)

  // Filtrar slots del médico que caigan en la semana visible
  const slotsMedico = medicoSeleccionado
    ? slots.filter(s => {
        if (s.medicoId !== medicoSeleccionado.id) return false
        return s.fecha >= toISO(semanaBase) && s.fecha <= toISO(semanaFin)
      })
    : []

  function handleSlotClick(slot) {
    alert(`Seleccionaste el slot:\n📅 ${slot.fecha}  🕐 ${slot.hora}\nMédico: ${medicoSeleccionado.nombre} ${medicoSeleccionado.apellido}`)
    // En Sprint 3 esto abrirá el modal de confirmación
  }

  const labelSemana = `${semanaBase.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${semanaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`

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

      {/* Spinner de carga */}
      {cargando && (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b' }}>
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

      {/* Paso 3: calendario con navegación de semana */}
      {medicoSeleccionado && !cargando && (
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

          <CalendarioSemana slots={slotsMedico} onSlotClick={handleSlotClick} />

          {slotsMedico.length === 0 && (
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ⚠ Sin disponibilidad esta semana.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default BuscarMedico