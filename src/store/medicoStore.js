// src/store/medicoStore.js
import { create } from 'zustand'

export const useMedicoStore = create((set, get) => ({
  slots: [],
  citaSeleccionada: null,
  loading: false,
  error: null,

  setSlots: (slots) => set({ slots }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  seleccionarCita: (slot) => set({ citaSeleccionada: slot }),
  cerrarPanel: () => set({ citaSeleccionada: null }),

  actualizarEstadoTurno: (turnoId, nuevoEstado) => {
    const { slots, citaSeleccionada } = get()
    set({
      slots: slots.map(s =>
        s.turno?.id === turnoId ? { ...s, turno: { ...s.turno, estado: nuevoEstado } } : s
      ),
      citaSeleccionada: citaSeleccionada?.turno?.id === turnoId
        ? { ...citaSeleccionada, turno: { ...citaSeleccionada.turno, estado: nuevoEstado } }
        : citaSeleccionada,
    })
  },

  liberarSlot: (turnoId) => {
    set(state => ({
      slots: state.slots.map(s =>
        s.turno?.id === turnoId ? { ...s, disponible: true, turno: undefined } : s
      ),
      citaSeleccionada: null,
    }))
  },

  reprogramarTurno: (turnoId, nuevaFecha, nuevaHora) => {
    const { slots, citaSeleccionada } = get()
    const turnoViejo = citaSeleccionada?.turno
    const sinViejo = slots.map(s =>
      s.turno?.id === turnoId ? { ...s, disponible: true, turno: undefined } : s
    )
    const actualizado = sinViejo.map(s =>
      s.fecha === nuevaFecha && s.hora === nuevaHora
        ? { ...s, disponible: false, turno: { ...turnoViejo, id: turnoId, estado: 'CONFIRMADO' } }
        : s
    )
    set({ slots: actualizado, citaSeleccionada: null })
  },
}))