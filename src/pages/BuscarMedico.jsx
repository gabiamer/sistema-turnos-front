// src/pages/BuscarMedico.jsx
import { useState } from 'react'
import { medicos, especialidades, slots } from '../mocks/mockData'
import SelectorEspecialidad from '../components/SelectorEspecialidad'
import ListaMedicos from '../components/ListaMedicos'
import CalendarioSemana from '../components/CalendarioSemana'

function BuscarMedico() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('Todas')
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)

  const medicosFiltrados = especialidadSeleccionada === 'Todas'
    ? medicos
    : medicos.filter(m => m.especialidad === especialidadSeleccionada)

  // Simula carga al seleccionar médico
  function handleVerDisponibilidad(medico) {
    setCargando(true)
    setMedicoSeleccionado(null)
    setTimeout(() => {
      setMedicoSeleccionado(medico)
      setCargando(false)
    }, 700) // simula llamada al backend
  }

  const slotsMedico = medicoSeleccionado
    ? slots.filter(s => s.medicoId === medicoSeleccionado.id)
    : []

  function handleSlotClick(slot) {
    alert(`Seleccionaste el slot:\n📅 ${slot.fecha}  🕐 ${slot.hora}\nMédico: ${medicoSeleccionado.nombre} ${medicoSeleccionado.apellido}`)
    // En Sprint 3 esto abrirá el modal de confirmación
  }

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

      {/* Paso 2: lista médicos — pasa la función al card */}
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

      {/* Paso 3: calendario de slots */}
      {medicoSeleccionado && !cargando && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Disponibilidad — Dr/a. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {medicoSeleccionado.especialidad}
          </p>

          <CalendarioSemana slots={slotsMedico} onSlotClick={handleSlotClick} />

          {slotsMedico.length === 0 && (
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ⚠ Este médico no tiene agenda configurada todavía.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default BuscarMedico