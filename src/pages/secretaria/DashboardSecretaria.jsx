// src/pages/secretaria/DashboardSecretaria.jsx — Luciana S5
import { useState, useEffect, useCallback } from 'react'
import { secretariaService } from '../../services/secretariaService'
import { personalStore }      from '../../store/personalStore'
import BuscadorPaciente        from '../../components/secretaria/BuscadorPaciente'
import ModalCancelarSecretaria from '../../components/secretaria/ModalCancelarSecretaria'

const ESTADO_COLOR = {
  CONFIRMADO: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  PENDIENTE:  { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  CANCELADO:  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  CONCLUIDA:  { bg: '#f8fafc', border: '#cbd5e1', text: '#64748b' },
}

export default function DashboardSecretaria() {
  const personal = personalStore.get()

  const [turnosHoy, setTurnosHoy]       = useState([])
  const [loadingTabla, setLoadingTabla] = useState(true)
  const [errorTabla, setErrorTabla]     = useState('')
  const [turnoACancelar, setTurnoACancelar] = useState(null)
  const [toast, setToast] = useState(null)

  const cargarTurnos = useCallback(() => {
    setLoadingTabla(true)
    setErrorTabla('')
    secretariaService.getTurnosHoy()
      .then(data => setTurnosHoy(Array.isArray(data) ? data : []))
      .catch(() => setErrorTabla('No se pudieron cargar los turnos del día.'))
      .finally(() => setLoadingTabla(false))
  }, [])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  function mostrarToast(msg, tipo = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  function handleCanceladoOk() {
    cargarTurnos()
    mostrarToast('Turno cancelado.')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
          Panel de Secretaría
        </h1>
        {personal && (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {personal.nombre} · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000,
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          backgroundColor: toast.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.tipo === 'ok' ? '#86efac' : '#fecaca'}`,
          color: toast.tipo === 'ok' ? '#16a34a' : '#dc2626',
          fontSize: '0.875rem', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {toast.tipo === 'ok' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {/* Buscador */}
      <section style={{
        backgroundColor: 'white', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
          Buscar paciente
        </h2>
        <BuscadorPaciente
          onAgendar={() => mostrarToast('Modal de agendado pendiente (Adriana).', 'info')}
          onRegistrar={() => mostrarToast('Usá el formulario de registro de pacientes.', 'info')}
        />
      </section>

      {/* Tabla turnos del día */}
      <section style={{
        backgroundColor: 'white', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>Turnos de hoy</h2>
          <button
            onClick={cargarTurnos}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: '6px',
              border: '1px solid #e2e8f0', backgroundColor: 'white',
              color: '#64748b', fontSize: '0.8rem', cursor: 'pointer',
            }}
          >↺ Recargar</button>
        </div>

        {loadingTabla && (
          <div aria-live="polite" style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>
            Cargando turnos del día…
          </div>
        )}

        {errorTabla && !loadingTabla && (
          <div role="alert" style={{
            padding: '0.75rem 1rem', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '8px',
            color: '#dc2626', fontSize: '0.875rem',
          }}>
            ⚠ {errorTabla}
          </div>
        )}

        {!loadingTabla && !errorTabla && turnosHoy.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            Sin turnos programados para hoy.
          </p>
        )}

        {!loadingTabla && turnosHoy.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {turnosHoy.map(t => {
              const col = ESTADO_COLOR[t.estado] ?? ESTADO_COLOR.CONFIRMADO
              const cancelable = t.estado === 'CONFIRMADO' || t.estado === 'PENDIENTE'
              return (
                <div key={t.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1rem', borderRadius: '10px',
                  border: '1px solid #e2e8f0', backgroundColor: '#fafafa',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem', marginBottom: '0.15rem' }}>
                      {t.hora} · Dr/a. {t.medico?.nombre} {t.medico?.apellido}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {t.paciente?.nombre} {t.paciente?.apellido}
                      {t.medico?.especialidad ? ` · ${t.medico.especialidad}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: '600',
                      padding: '0.25rem 0.6rem', borderRadius: '999px',
                      backgroundColor: col.bg, border: `1px solid ${col.border}`, color: col.text,
                      whiteSpace: 'nowrap',
                    }}>
                      {t.estado}
                    </span>
                    {cancelable && (
                      <button
                        onClick={() => setTurnoACancelar(t)}
                        style={{
                          padding: '0.25rem 0.6rem', borderRadius: '6px',
                          border: '1px solid #fecaca', backgroundColor: 'transparent',
                          color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer',
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
      </section>

      {/* Modal cancelar */}
      {turnoACancelar && (
        <ModalCancelarSecretaria
          turno={turnoACancelar}
          onCerrar={() => setTurnoACancelar(null)}
          onCancelado={handleCanceladoOk}
        />
      )}
    </div>
  )
}