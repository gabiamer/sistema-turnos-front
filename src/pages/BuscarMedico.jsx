// src/pages/BuscarMedico.jsx
import { useState, useEffect } from 'react'
import { medicoService } from '../services/medicoService'
import { disponibilidadService } from '../services/disponibilidadService'

import SearchBar        from '../components/buscar-medico/SearchBar'
import FiltrosEspecialidad from '../components/buscar-medico/FiltrosEspecialidad'
import ListaMedicosV2   from '../components/buscar-medico/ListaMedicosV2'
import CalendarioSemana    from '../components/CalendarioSemana'
import MedicosAlternativos from '../components/MedicosAlternativos'
import ModalTurno          from '../components/ModalTurno'

function getLunes(fecha) {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0,0,0,0)
  return d
}
function toISO(fecha) { return fecha.toISOString().slice(0,10) }

function BuscarMedico() {
  const [medicos, setMedicos]                       = useState([])
  const [especialidades, setEspecialidades]         = useState(['Todas'])
  const [cargandoMedicos, setCargandoMedicos]       = useState(true)
  const [busqueda, setBusqueda]                     = useState('')
  const [especialidadSeleccionada, setEspecialidad] = useState('Todas')
  const [medicoSeleccionado, setMedico]             = useState(null)
  const [semanaBase, setSemanaBase]                 = useState(() => getLunes(new Date()))
  const [slots, setSlots]                           = useState([])
  const [cargandoSlots, setCargando]                = useState(false)
  const [errorSlots, setError]                      = useState('')
  const [slotModal, setSlotModal]                   = useState(null)
  const [modalAbierto, setModalAbierto]             = useState(false)

  useEffect(() => {
    medicoService.getAll()
      .then(data => {
        setMedicos(data)
        setEspecialidades(['Todas', ...new Set(data.map(m => m.especialidad))])
      })
      .catch(err => console.error('Error cargando médicos:', err))
      .finally(() => setCargandoMedicos(false))
  }, [])

  useEffect(() => {
    if (!medicoSeleccionado) return
    setCargando(true); setError(''); setSlots([])
    disponibilidadService.getSlots(medicoSeleccionado.id, toISO(semanaBase))
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(err => setError(err.response?.status === 404 ? 'sin-agenda' : 'error-red'))
      .finally(() => setCargando(false))
  }, [medicoSeleccionado, semanaBase])

  const medicosFiltrados = medicos
    .filter(m => especialidadSeleccionada === 'Todas' || m.especialidad === especialidadSeleccionada)
    .filter(m => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      return m.nombre.toLowerCase().includes(q) || m.apellido.toLowerCase().includes(q) || m.especialidad.toLowerCase().includes(q)
    })

  const medicosEspecialidad = medicoSeleccionado
    ? medicos.filter(m => m.especialidad === medicoSeleccionado.especialidad)
    : []

  const handleVerDisponibilidad = (medico) => {
    setMedico(medico); setSemanaBase(getLunes(new Date())); setSlotModal(null); setModalAbierto(true)
  }

  const semanaFin = new Date(semanaBase); semanaFin.setDate(semanaFin.getDate() + 6)
  const labelSemana = `${semanaBase.toLocaleDateString('es-ES',{day:'numeric',month:'short'})} – ${semanaFin.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}`

  const haySlots  = slots.length > 0
  const sinAgenda = errorSlots === 'sin-agenda'
  const errorRed  = errorSlots === 'error-red'

  const fontLink = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%, rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 60% 20%, rgba(220,234,243,0.4) 0%, transparent 40%)
      `,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        ${fontLink}
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      <div style={{ padding: 'clamp(2.5rem,5vw,4rem) clamp(2rem,5vw,4rem) clamp(1.5rem,3vw,3rem)', maxWidth: '1400px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Portal de salud — Turnos online
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', marginBottom: 'clamp(2rem,4vw,3.5rem)' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', fontWeight: '400', color: '#1c3545', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0, maxWidth: '520px' }}>
            Encuentra<br />
            <em style={{ fontStyle: 'italic', color: '#4a7c9e' }}>el médico</em><br />
            ideal para ti.
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#4a7c9e', lineHeight: 1.7, maxWidth: '280px', marginTop: '0.5rem', fontWeight: '300', alignSelf: 'flex-end', paddingBottom: '0.5rem' }}>
            Busca por nombre o especialidad y reserva tu turno de forma rápida y segura.
          </p>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: 'clamp(1.25rem,3vw,2rem)', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 40px rgba(74,124,158,0.12)', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <SearchBar valor={busqueda} onChange={setBusqueda} />
          <FiltrosEspecialidad
            especialidades={especialidades}
            seleccionada={especialidadSeleccionada}
            onCambio={esp => { setEspecialidad(esp); setMedico(null); setSlots([]); setError(''); setSlotModal(null); setModalAbierto(false) }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(2rem,5vw,4rem) clamp(3rem,6vw,5rem)', animation: 'fadeUp 0.5s ease 0.2s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '0.78rem', color: '#7fa3b8', fontWeight: '400', letterSpacing: '0.04em' }}>
            {cargandoMedicos ? 'Cargando...' : `${medicosFiltrados.length} resultado${medicosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
          {(busqueda || especialidadSeleccionada !== 'Todas') && (
            <button onClick={() => { setBusqueda(''); setEspecialidad('Todas') }} style={{ fontSize: '0.75rem', color: '#4a7c9e', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 }}>
              Limpiar filtros
            </button>
          )}
        </div>

        <ListaMedicosV2 medicos={medicosFiltrados} onVerDisponibilidad={handleVerDisponibilidad} />
      </div>

      {modalAbierto && medicoSeleccionado && (
        <div onClick={() => setModalAbierto(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,53,69,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'rgba(240,248,252,0.98)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(28,53,69,0.22)', border: '1.5px solid rgba(255,255,255,0.8)', animation: 'modalIn 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '400', color: '#1c3545', margin: '0 0 0.25rem', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Dr. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#4a7c9e', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '500' }}>
                  {medicoSeleccionado.especialidad}
                </span>
              </div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(74,124,158,0.1)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', color: '#4a7c9e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setSemanaBase(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return d })} style={btnNav}>← Anterior</button>
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#2c4a5a' }}>{labelSemana}</span>
              <button onClick={() => setSemanaBase(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return d })} style={btnNav}>Siguiente →</button>
            </div>

            {cargandoSlots && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7fa3b8' }}>
                <div style={{ display: 'inline-block', width: '26px', height: '26px', border: '2.5px solid #dde8ef', borderTopColor: '#4a7c9e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <p style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>Cargando disponibilidad...</p>
              </div>
            )}
            {!cargandoSlots && errorRed && (
              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '14px', color: '#dc2626', fontSize: '0.85rem' }}>⚠ No se pudo cargar la disponibilidad.</div>
            )}
            {!cargandoSlots && sinAgenda && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(74,124,158,0.08)', borderRadius: '14px', color: '#4a7c9e', fontSize: '0.85rem' }}>📋 Este médico todavía no tiene agenda configurada.</div>
            )}
            {!cargandoSlots && !errorSlots && !haySlots && (
              <p style={{ color: '#c9a96e', fontSize: '0.85rem' }}>⚠ Sin disponibilidad esta semana.</p>
            )}
            {!cargandoSlots && haySlots && (
              <CalendarioSemana slots={slots} onSlotClick={slot => { setModalAbierto(false); setSlotModal(slot) }} />
            )}
            {!cargandoSlots && (sinAgenda || (!haySlots && !errorRed)) && (
              <MedicosAlternativos medicos={medicosEspecialidad} medicoActualId={medicoSeleccionado.id} onVerDisponibilidad={handleVerDisponibilidad} />
            )}
          </div>
        </div>
      )}

      {slotModal && medicoSeleccionado && (
        <ModalTurno slot={slotModal} medico={medicoSeleccionado} onCerrar={() => setSlotModal(null)} />
      )}
    </div>
  )
}

const btnNav = {
  padding: '0.4rem 1rem', borderRadius: '50px',
  border: '1.5px solid rgba(74,124,158,0.3)',
  backgroundColor: 'rgba(255,255,255,0.7)',
  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500',
  color: '#4a7c9e', fontFamily: "'DM Sans', sans-serif",
  transition: 'all 0.18s',
}

export default BuscarMedico