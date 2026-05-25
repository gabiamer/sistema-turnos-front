// src/pages/agenda/GestionAgendaPage.jsx
import { useState, useEffect } from 'react';
import { agendaService } from '../../services/agendaService';
import { medicoService } from '../../services/medicoService';

const DIAS = [
    { label: 'Lunes',     value: 1 },
    { label: 'Martes',    value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves',    value: 4 },
    { label: 'Viernes',   value: 5 },
    { label: 'Sábado',    value: 6 },
    { label: 'Domingo',   value: 7 },
];

const DURACIONES = [15, 20, 30, 45, 60];

// Mock: en producción esto viene del login/session
const MEDICO_ID = 1;

export default function GestionAgendaPage() {
    const [medico, setMedico] = useState(null);
    const [diasSeleccionados, setDiasSeleccionados] = useState({});
    const [duracion, setDuracion] = useState(30);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    // Bloqueos
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin]       = useState('');
    const [motivo, setMotivo]           = useState('');
    const [loadingBloqueo, setLoadingBloqueo] = useState(false);
    const [mensajeBloqueo, setMensajeBloqueo] = useState(null);

    useEffect(() => {
        medicoService.getById(MEDICO_ID).then(setMedico).catch(console.error);

        agendaService.getByMedico(MEDICO_ID).then((agenda) => {
            const initial = {};
            agenda.filter(a => a.activo).forEach(a => {
                initial[a.diaSemana] = {
                    horaInicio: a.horaInicio,
                    horaFin:    a.horaFin,
                };
            });
            setDiasSeleccionados(initial);
        }).catch(console.error);
    }, []);

    const toggleDia = (diaValue) => {
        setDiasSeleccionados(prev => {
            const copy = { ...prev };
            if (copy[diaValue]) {
                delete copy[diaValue];
            } else {
                copy[diaValue] = { horaInicio: '08:00', horaFin: '17:00' };
            }
            return copy;
        });
    };

    const updateHora = (diaValue, campo, valor) => {
        setDiasSeleccionados(prev => ({
            ...prev,
            [diaValue]: { ...prev[diaValue], [campo]: valor },
        }));
    };

    const guardarAgenda = async () => {
        setLoading(true);
        setMensaje(null);
        setError(null);

        const dias = Object.entries(diasSeleccionados).map(([dia, horas]) => ({
            diaSemana:       Number(dia),
            horaInicio:      horas.horaInicio,
            horaFin:         horas.horaFin,
            duracionMinutos: duracion,
        }));

        try {
            await agendaService.actualizarAgenda(MEDICO_ID, dias);
            setMensaje('✅ Agenda guardada correctamente');
        } catch (err) {
            if (err.response?.status === 409) {
                setError('⚠ Hay turnos confirmados en el horario que querés modificar. Reasignalos antes de cambiar la agenda.');
            } else {
                setError('Error al guardar la agenda. Intentá de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const guardarBloqueo = async () => {
        if (!fechaInicio || !fechaFin) {
            setMensajeBloqueo({ tipo: 'error', texto: 'Seleccioná un rango de fechas.' });
            return;
        }
        setLoadingBloqueo(true);
        setMensajeBloqueo(null);
        try {
            await agendaService.crearBloqueo(MEDICO_ID, { fechaInicio, fechaFin, motivo });
            setMensajeBloqueo({ tipo: 'ok', texto: '✅ Bloqueo registrado.' });
            setFechaInicio('');
            setFechaFin('');
            setMotivo('');
        } catch (err) {
            if (err.response?.status === 409) {
                setMensajeBloqueo({ tipo: 'error', texto: '⚠ Hay turnos confirmados en ese período.' });
            } else {
                setMensajeBloqueo({ tipo: 'error', texto: 'Error al guardar el bloqueo.' });
            }
        } finally {
            setLoadingBloqueo(false);
        }
    };

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '0.25rem' }}>Gestión de Agenda</h1>
            {medico && (
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    Dr. {medico.nombre} {medico.apellido} — {medico.especialidad}
                </p>
            )}

            {/* ── Días y horarios ── */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Días de atención</h2>

                {DIAS.map(dia => (
                    <div key={dia.value} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                        <label style={{ width: 90, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={!!diasSeleccionados[dia.value]}
                                onChange={() => toggleDia(dia.value)}
                            />
                            {dia.label}
                        </label>

                        {diasSeleccionados[dia.value] && (
                            <>
                                <input
                                    type="time"
                                    value={diasSeleccionados[dia.value].horaInicio}
                                    onChange={e => updateHora(dia.value, 'horaInicio', e.target.value)}
                                />
                                <span>–</span>
                                <input
                                    type="time"
                                    value={diasSeleccionados[dia.value].horaFin}
                                    onChange={e => updateHora(dia.value, 'horaFin', e.target.value)}
                                />
                            </>
                        )}
                    </div>
                ))}

                {/* Duración del turno */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label>Duración del turno:</label>
                    {DURACIONES.map(d => (
                        <label key={d} style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="duracion"
                                value={d}
                                checked={duracion === d}
                                onChange={() => setDuracion(d)}
                            />
                            {' '}{d} min
                        </label>
                    ))}
                </div>

                {mensaje && <p style={{ color: 'green',  marginTop: '0.75rem' }}>{mensaje}</p>}
                {error   && <p style={{ color: '#c0392b', marginTop: '0.75rem' }}>{error}</p>}

                <button
                    onClick={guardarAgenda}
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
                >
                    {loading ? 'Guardando...' : 'Guardar agenda'}
                </button>
            </section>

            <hr />

            {/* ── Bloquear días ── */}
            <section style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Bloquear días</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
                    <label>
                        Desde:
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ marginLeft: '0.5rem' }} />
                    </label>
                    <label>
                        Hasta:
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ marginLeft: '0.5rem' }} />
                    </label>
                    <label>
                        Motivo:
                        <input
                            type="text"
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Vacaciones, congreso..."
                            style={{ marginLeft: '0.5rem', width: '100%' }}
                        />
                    </label>

                    {mensajeBloqueo && (
                        <p style={{ color: mensajeBloqueo.tipo === 'ok' ? 'green' : '#c0392b' }}>
                            {mensajeBloqueo.texto}
                        </p>
                    )}

                    <button
                        onClick={guardarBloqueo}
                        disabled={loadingBloqueo}
                        style={{ padding: '0.5rem 1.5rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                    >
                        {loadingBloqueo ? 'Guardando...' : 'Registrar bloqueo'}
                    </button>
                </div>
            </section>
        </div>
    );
}