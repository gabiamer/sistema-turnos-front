// src/pages/secretaria/DashboardSecretaria.jsx
import { useState, useEffect, useCallback } from 'react'
import { secretariaFacade }        from '../../facades/secretariaFacade'
import { personalStore }           from '../../store/personalStore'
import BuscadorPaciente            from '../../components/secretaria/BuscadorPaciente'
import ModalCancelarSecretaria     from '../../components/secretaria/ModalCancelarSecretaria'
import ModalAgendarSecretaria      from '../../components/secretaria/ModalAgendarSecretaria'

const ESTADO_STYLE = {
  CONFIRMADO: { bg: 'rgba(16,141,91,0.08)', border: 'rgba(16,141,91,0.2)', color: '#0d7a4f' },
  PENDIENTE:  { bg: 'rgba(180,120,30,0.08)', border: 'rgba(180,120,30,0.2)', color: '#a06010' },
  CANCELADO:  { bg: 'rgba(200,40,40,0.07)', border: 'rgba(200,40,40,0.18)', color: '#b92222' },
  CONCLUIDA:  { bg: 'rgba(90,100,120,0.07)', border: 'rgba(90,100,120,0.15)', color: '#5a6478' },
}

const FONT = "'DM Sans','Helvetica Neue',sans-serif"
const SERIF = "'DM Serif Display',Georgia,serif"

const LABEL_ESTADO = {
  CONFIRMADO: 'Confirmado',
  PENDIENTE: 'Pendiente',
  CANCELADO: 'Cancelado',
  CONCLUIDA: 'Concluida',
}

export default function DashboardSecretaria() {
  const personal = personalStore.get()

  const [turnosHoy, setTurnosHoy]           = useState([])
  const [loadingTabla, setLoadingTabla]     = useState(true)
  const [errorTabla, setErrorTabla]         = useState('')
  const [turnoACancelar, setTurnoACancelar] = useState(null)
  const [toast, setToast]                   = useState(null)
  const [pacienteAgendar, setPacienteAgendar] = useState(null)
  const [kpis, setKpis]                     = useState({ total: 0, confirmados: 0, pendientes: 0 })

  const cargarTurnos = useCallback(() => {
    setLoadingTabla(true)
    setErrorTabla('')
    secretariaFacade.cargarAgendaHoy()
      .then(({ turnos, kpis: k }) => { setTurnosHoy(turnos); setKpis(k) })
      .catch(() => setErrorTabla('No se pudieron cargar los turnos del día.'))
      .finally(() => setLoadingTabla(false))
  }, [])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  function mostrarToast(msg, tipo = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const nombre = personal?.nombre?.split(' ')[0] ?? 'Secretaria'
  const fecha = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: '#dce8f0', fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .sec-row:hover { background: rgba(255,255,255,0.85) !important; }
        .sec-btn-ghost:hover { background: rgba(74,106,140,0.08) !important; }
        .sec-btn-danger:hover { background: rgba(185,34,34,0.07) !important; }
        .sec-card { animation: fadeUp 0.4s ease both; }
        .sec-card:nth-child(2) { animation-delay: 0.07s; }
        .sec-card:nth-child(3) { animation-delay: 0.14s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div role="status" style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000,
          padding: '0.7rem 1.2rem',
          borderRadius: 12,
          background: toast.tipo === 'ok' ? 'rgba(13,122,79,0.1)' : 'rgba(185,34,34,0.08)',
          border: `1px solid ${toast.tipo === 'ok' ? 'rgba(13,122,79,0.25)' : 'rgba(185,34,34,0.2)'}`,
          color: toast.tipo === 'ok' ? '#0d7a4f' : '#b92222',
          fontSize: '0.85rem', fontWeight: 500,
          backdropFilter: 'blur(12px)',
          fontFamily: FONT,
          animation: 'toastIn 0.25s ease',
        }}>
          {toast.tipo === 'ok' ? '✓' : '⚠'}&ensp;{toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(2rem,5vw,3.5rem) clamp(1rem,4vw,2rem)' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', animation: 'fadeUp 0.35s ease' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 500, color: '#5a7a9a', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Panel de secretaría
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, color: '#1a2e3f', margin: '0 0 0.4rem', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Bienvenida, {nombre}.
          </h1>
          <p style={{ color: '#6a8aa8', fontSize: '0.875rem', margin: 0, fontWeight: 300, fontStyle: 'italic' }}>
            {fechaCap}
          </p>
        </div>

        {/* KPI Strip — solo cuando hay datos */}
        {!loadingTabla && turnosHoy.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', animation: 'fadeUp 0.4s ease 0.05s both' }}>
            {[
              { label: 'Total hoy',   val: kpis.total,       accent: '#3a6a9e' },
              { label: 'Confirmados', val: kpis.confirmados, accent: '#0d7a4f' },
              { label: 'Pendientes',  val: kpis.pendientes,  accent: '#a06010' },
            ].map(k => (
              <div key={k.label} style={{
                flex: 1, padding: '0.9rem 1.1rem',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)',
              }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 500, color: '#7a96b0', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.3rem' }}>
                  {k.label}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: '1.75rem', fontWeight: 400, color: k.accent, margin: 0, lineHeight: 1 }}>
                  {k.val}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Buscar paciente */}
        <div className="sec-card" style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.92)',
          padding: '1.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 500, color: '#5a7a9a', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
              Gestión
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 400, color: '#1a2e3f', margin: 0 }}>
              Buscar paciente
            </h2>
          </div>
          <BuscadorPaciente
            onAgendar={(paciente) => setPacienteAgendar(paciente)}
            onRegistrar={() => mostrarToast('Usá el formulario de registro de pacientes.', 'info')}
          />
        </div>

        {/* Turnos de hoy */}
        <div className="sec-card" style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.92)',
          padding: '1.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 500, color: '#5a7a9a', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
                Agenda
              </p>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 400, color: '#1a2e3f', margin: 0 }}>
                Turnos de hoy
              </h2>
            </div>
            <button
              className="sec-btn-ghost"
              onClick={cargarTurnos}
              style={{
                padding: '0.4rem 1rem', borderRadius: 50,
                border: '1px solid rgba(74,106,140,0.2)',
                background: 'transparent', color: '#5a7a9a',
                fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: FONT, transition: 'background 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              ↺&ensp;Recargar
            </button>
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: 'rgba(74,106,140,0.1)', marginBottom: '1.25rem' }} />

          {loadingTabla && (
            <p style={{ color: '#7a96b0', fontSize: '0.875rem', padding: '2rem 0', textAlign: 'center', margin: 0, fontStyle: 'italic', fontWeight: 300 }}>
              Cargando agenda…
            </p>
          )}

          {errorTabla && !loadingTabla && (
            <div role="alert" style={{
              padding: '0.75rem 1.1rem',
              background: 'rgba(185,34,34,0.06)',
              border: '1px solid rgba(185,34,34,0.18)',
              borderRadius: 12, color: '#b92222', fontSize: '0.85rem',
            }}>
              ⚠&ensp;{errorTabla}
            </div>
          )}

          {!loadingTabla && !errorTabla && turnosHoy.length === 0 && (
            <div style={{ padding: '2.5rem 0', textAlign: 'center' }}>
              <p style={{ color: '#a0b4c8', fontSize: '2rem', margin: '0 0 0.5rem', fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic' }}>
                —
              </p>
              <p style={{ color: '#8aa4b8', fontSize: '0.875rem', margin: 0, fontWeight: 300 }}>
                Sin turnos programados para hoy.
              </p>
            </div>
          )}

          {!loadingTabla && turnosHoy.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {turnosHoy.map((t, i) => {
                const col = ESTADO_STYLE[t.estado] ?? ESTADO_STYLE.CONFIRMADO
                const cancelable = t.estado === 'CONFIRMADO' || t.estado === 'PENDIENTE'
                return (
                  <div
                    key={t.id}
                    className="sec-row"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                      padding: '0.85rem 1rem', borderRadius: 13,
                      border: '1px solid rgba(74,106,140,0.1)',
                      background: 'rgba(255,255,255,0.5)',
                      transition: 'background 0.15s',
                      animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                    }}
                  >
                    {/* Hora pill */}
                    <div style={{
                      minWidth: 52, padding: '0.3rem 0.6rem', borderRadius: 8,
                      background: 'rgba(58,106,158,0.08)',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontFamily: "'DM Sans',monospace", fontSize: '0.8rem', fontWeight: 600, color: '#3a6a9e', margin: 0 }}>
                        {t.hora}
                      </p>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, color: '#1a2e3f', fontSize: '0.875rem', margin: '0 0 0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.paciente?.nombre} {t.paciente?.apellido}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#7a96b0', margin: 0, fontWeight: 300 }}>
                        Dr/a. {t.medico?.nombre} {t.medico?.apellido}
                        {t.medico?.especialidad ? ` · ${t.medico.especialidad}` : ''}
                      </p>
                    </div>

                    {/* Estado + acción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600,
                        padding: '0.22rem 0.65rem', borderRadius: 999,
                        background: col.bg, border: `1px solid ${col.border}`, color: col.color,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {LABEL_ESTADO[t.estado] ?? t.estado}
                      </span>
                      {cancelable && (
                        <button
                          className="sec-btn-danger"
                          onClick={() => setTurnoACancelar(t)}
                          style={{
                            padding: '0.22rem 0.7rem', borderRadius: 8,
                            border: '1px solid rgba(185,34,34,0.2)',
                            background: 'transparent', color: '#b92222',
                            fontSize: '0.75rem', cursor: 'pointer',
                            fontFamily: FONT, transition: 'background 0.15s',
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {turnoACancelar && (
        <ModalCancelarSecretaria
          turno={turnoACancelar}
          onCerrar={() => setTurnoACancelar(null)}
          onCancelado={() => { cargarTurnos(); mostrarToast('Turno cancelado correctamente.') }}
        />
      )}

      {pacienteAgendar && (
        <ModalAgendarSecretaria
          pacienteInicial={pacienteAgendar}
          onClose={() => setPacienteAgendar(null)}
          onAgendado={(r) => { cargarTurnos(); mostrarToast(`Turno #${r.turnoId} confirmado correctamente ✓`) }}
        />
      )}
    </div>
  )
}