// src/domain/turno-booking/BookingStates.js
// Patrón State — formaliza las fases del flujo de reserva de turnos.
// Define los estados posibles, sus transiciones válidas y su metadata.

export const BOOKING_STATES = {
  IDENTIFICACION: 'identificacion',
  RESUMEN:        'resumen',
  BLOQUEANDO:     'bloqueando',
  EXPIRADO:       'expirado',
  ERROR:          'error',
}

// Transiciones permitidas desde cada estado
const TRANSITIONS = {
  [BOOKING_STATES.IDENTIFICACION]: [BOOKING_STATES.RESUMEN],
  [BOOKING_STATES.RESUMEN]:        [BOOKING_STATES.BLOQUEANDO],
  [BOOKING_STATES.BLOQUEANDO]:     [BOOKING_STATES.EXPIRADO, BOOKING_STATES.ERROR],
  [BOOKING_STATES.EXPIRADO]:       [BOOKING_STATES.RESUMEN],
  [BOOKING_STATES.ERROR]:          [],
}

// Metadata de cada estado (OCP: agregar estado = agregar entrada aquí)
export const BOOKING_STATE_META = {
  [BOOKING_STATES.IDENTIFICACION]: { titulo: 'Identifícate',     puedeCerrar: true  },
  [BOOKING_STATES.RESUMEN]:        { titulo: 'Confirma tu cita', puedeCerrar: true  },
  [BOOKING_STATES.BLOQUEANDO]:     { titulo: 'Confirma tu cita', puedeCerrar: false },
  [BOOKING_STATES.EXPIRADO]:       { titulo: 'Confirma tu cita', puedeCerrar: true  },
  [BOOKING_STATES.ERROR]:          { titulo: 'Confirma tu cita', puedeCerrar: true  },
}

/**
 * Valida y ejecuta una transición de estado.
 * Devuelve el nuevo estado; emite un warning si la transición no está permitida
 * pero la ejecuta de todas formas para no bloquear el flujo en producción.
 */
export function transicionar(actual, siguiente) {
  const permitidas = TRANSITIONS[actual] ?? []
  if (!permitidas.includes(siguiente)) {
    console.warn(`[BookingState] Transición inesperada: ${actual} → ${siguiente}`)
  }
  return siguiente
}
