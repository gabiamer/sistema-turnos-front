// src/pages/secretaria/ModalAgendarSecretaria.jsx — Adriana S5
// Modal 3 pasos: buscar/recibir paciente → elegir médico + fecha/hora → confirmar
// Usa apiPersonal (igual que secretariaService) para que X-User-Role se inyecte automático
// Props:
//   pacienteInicial  {object|null}  si viene del BuscadorPaciente ya tenemos el paciente
//   onClose          {fn}
//   onAgendado       {fn}  recibe el resultado del back

import { useState, useEffect } from 'react'
import { secretariaService }    from '../../services/secretariaService'
import { medicoService }        from '../../services/medicoService'
import { disponibilidadService } from '../../services/disponibilidadService'

function lunesDe(fechaISO) {
  const d = new Date(fechaISO + 'T00:00:00')
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

const hoy = new Date().toISOString().split('T')[0]

export default function ModalAgendarSecretaria({ pacienteInicial = null, onClose, onAgendado }) {

  // ── Paso 1: paciente ──────────────────────────────────────────────────────
  const [paciente, setPaciente] = useState(pacienteInicial)
  const [paso, setPaso]         = useState(pacienteInicial ? 2 : 1)

  // búsqueda manual (si no viene pacienteInicial)
  const [query, setQuery]           = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando]     = useState(false)
  const [errBusq, setErrBusq]       = useState('')

  // ── Paso 2: médico + fecha + hora ─────────────────────────────────────────
  const [medicos, setMedicos]           = useState([])
  const [medicoId, setMedicoId]         = useState('')
  const [fecha, setFecha]               = useState('')
  const [slots, setSlots]               = useState([])
  const [hora, setHora]                 = useState('')
  const [cargandoSlots, setCargandoSlots] = useState(false)

  // ── Paso 3: confirmar ─────────────────────────────────────────────────────
  const [guardando, setGuardando]   = useState(false)
  const [errGuardar, setErrGuardar] = useState('')

  // cargar médicos al montar
  useEffect(() => {
    medicoService.getAll().then(setMedicos).catch(() => {})
  }, [])

  // cargar slots cuando cambia médico o fecha
  useEffect(() => {
    if (!medicoId || !fecha) { setSlots([]); setHora(''); return }
    setCargandoSlots(true)
    disponibilidadService.getSlots(Number(medicoId), lunesDe(fecha))
      .then(data => {
        const libres = (data || []).filter(s => s.fecha === fecha && s.disponible && !s.bloqueado)
        setSlots(libres)
        setHora('')
      })
      .catch(() => setSlots([]))
      .finally(() => setCargandoSlots(false))
  }, [medicoId, fecha])

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function buscar(e) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) { setErrBusq('Ingresá al menos 2 caracteres.'); return }
    setBuscando(true); setErrBusq(''); setResultados([])
    try {
      const data = await secretariaService.buscarPaciente(q)
      setResultados(Array.isArray(data) ? data : [])
      if (!data.length) setErrBusq('No se encontró ningún paciente.')
    } catch { setErrBusq('Error al buscar. Intentá de nuevo.') }
    finally { setBuscando(false) }
  }

  async function confirmar() {
    setGuardando(true); setErrGuardar('')
    try {
      const resultado = await secretariaService.agendarTurno({
        pacienteId: paciente.id,
        medicoId:   Number(medicoId),
        fecha,
        hora,
      })
      onAgendado?.(resultado)
      onClose()
    } catch (err) {
      setErrGuardar(err?.response?.data?.error || 'No se pudo agendar el turno.')
    } finally { setGuardando(false) }
  }

  const medicoObj = medicos.find(m => String(m.id) === String(medicoId))

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  }
  const card = {
    background: 'white', borderRadius: 16, padding: '1.75rem',
    width: '100%', maxWidth: 520,
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    maxHeight: '90vh', overflowY: 'auto',
  }
  const btn = (variant = 'primary') => ({
    padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    ...(variant === 'primary'  && { background: '#2563eb', color: 'white' }),
    ...(variant === 'outline'  && { background: 'white',   color: '#2563eb', border: '1px solid #93c5fd' }),
    ...(variant === 'ghost'    && { background: '#f1f5f9', color: '#64748b' }),
    ...(variant === 'success'  && { background: '#16a34a', color: 'white' }),
  })
  const input = {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: 8,
    border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  }
  const label = {
    display: 'block', marginBottom: 5,
    fontSize: '0.72rem', fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              Paso {paso} de 3
            </p>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
              {paso === 1 ? 'Buscar paciente' : paso === 2 ? 'Elegir turno' : 'Confirmar'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: paso >= n ? '#2563eb' : '#e2e8f0',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {/* ── PASO 1 ── */}
        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <form onSubmit={buscar} style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...input, flex: 1 }}
                placeholder="CI o nombre del paciente…"
                value={query}
                onChange={e => { setQuery(e.target.value); setErrBusq('') }}
                autoFocus
              />
              <button type="submit" style={btn('primary')} disabled={buscando}>
                {buscando ? '…' : 'Buscar'}
              </button>
            </form>

            {errBusq && <p style={{ color: '#dc2626', fontSize: '0.83rem' }}>⚠ {errBusq}</p>}

            {resultados.map(p => (
              <div key={p.id} style={{
                padding: '0.85rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                    {p.nombre} {p.apellido}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>CI {p.ci}</p>
                </div>
                <button style={btn('primary')} onClick={() => { setPaciente(p); setPaso(2) }}>
                  Seleccionar →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 2 ── */}
        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* paciente seleccionado */}
            <div style={{ padding: '0.65rem 1rem', borderRadius: 8, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: '0.85rem', color: '#1d4ed8' }}>
              👤 <strong>{paciente.nombre} {paciente.apellido}</strong> · CI {paciente.ci}
            </div>

            <div>
              <label style={label}>Médico</label>
              <select style={input} value={medicoId} onChange={e => { setMedicoId(e.target.value); setHora('') }}>
                <option value="">Seleccioná un médico</option>
                {medicos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} {m.apellido} — {m.especialidad}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={label}>Fecha</label>
              <input style={input} type="date" value={fecha} min={hoy}
                onChange={e => { setFecha(e.target.value); setHora('') }} />
            </div>

            {medicoId && fecha && (
              <div>
                <label style={label}>
                  Horario {cargandoSlots && <span style={{ fontWeight: 400 }}>· cargando…</span>}
                </label>
                {!cargandoSlots && slots.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '0.83rem' }}>Sin horarios disponibles ese día.</p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {slots.map(s => (
                    <button key={s.hora} onClick={() => setHora(s.hora)} style={{
                      padding: '0.4rem 0.85rem', borderRadius: 99,
                      border: `1.5px solid ${hora === s.hora ? '#2563eb' : '#cbd5e1'}`,
                      background: hora === s.hora ? '#2563eb' : 'white',
                      color: hora === s.hora ? 'white' : '#374151',
                      fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                    }}>
                      {s.hora.substring(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={{ ...btn('ghost'), flex: 1 }} onClick={() => setPaso(1)}>← Volver</button>
              <button
                style={{ ...btn('primary'), flex: 2, opacity: (!medicoId || !fecha || !hora) ? 0.5 : 1 }}
                disabled={!medicoId || !fecha || !hora}
                onClick={() => setPaso(3)}
              >
                Revisar →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 ── */}
        {paso === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FilaResumen label="Paciente"    valor={`${paciente.nombre} ${paciente.apellido} (CI ${paciente.ci})`} />
              <FilaResumen label="Médico"      valor={medicoObj ? `${medicoObj.nombre} ${medicoObj.apellido} — ${medicoObj.especialidad}` : medicoId} />
              <FilaResumen label="Fecha"       valor={fecha} />
              <FilaResumen label="Hora"        valor={hora.substring(0, 5)} />
              <FilaResumen label="Estado"      valor="CONFIRMADO" verde />
            </div>

            {errGuardar && (
              <div style={{ padding: '0.7rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: '0.83rem' }}>
                ⚠ {errGuardar}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btn('ghost'), flex: 1 }} onClick={() => setPaso(2)} disabled={guardando}>← Volver</button>
              <button style={{ ...btn('success'), flex: 2 }} onClick={confirmar} disabled={guardando}>
                {guardando ? 'Agendando…' : '✓ Confirmar turno'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function FilaResumen({ label, valor, verde }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', gap: 12 }}>
      <span style={{ color: '#94a3b8', flexShrink: 0 }}>{label}</span>
      <span style={{ color: verde ? '#16a34a' : '#1e293b', fontWeight: verde ? 700 : 500, textAlign: 'right' }}>{valor}</span>
    </div>
  )
}