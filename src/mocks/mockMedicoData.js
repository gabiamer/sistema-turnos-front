// src/mocks/mockMedicoData.js
// Mock para la vista del médico.
// Los slots con turno incluyen datos completos del paciente,
// igual que lo que devolvería el back enriquecido.

export const MEDICO_MOCK = {
  id: 1,
  nombre: 'Carlos',
  apellido: 'Romero',
  especialidad: 'Cardiología',
  email: 'cromero@clinica.com',
}

function getLunesActual() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff)
  hoy.setHours(0, 0, 0, 0)
  return hoy
}

export function generarSlotsMedicoMock(medicoId, fechaLunes) {
  const lunes = fechaLunes ?? getLunesActual()
  const horas = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30']

  const pacientesMock = [
    { id: 10, nombre: 'Maria Lopez',       ci: '12345678' },
    { id: 11, nombre: 'Pedro Gutierrez',   ci: '87654321' },
    { id: 12, nombre: 'Ana Flores',        ci: '55556666' },
    { id: 13, nombre: 'Jorge Mamani',      ci: '11223344' },
    { id: 14, nombre: 'Lucia Condori',     ci: '44332211' },
  ]

  const slots = []
  for (let dia = 0; dia < 5; dia++) {
    const fecha = new Date(lunes)
    fecha.setDate(fecha.getDate() + dia)
    const fechaStr = fecha.toISOString().split('T')[0]

    horas.forEach((hora, idx) => {
      const seed = (medicoId * 7 + dia * 5 + idx * 3) % 5

      if (seed === 4) {
        // Bloqueado
        slots.push({ fecha: fechaStr, hora, disponible: false, bloqueado: true })
      } else if (seed === 0) {
        // Ocupado — CONFIRMADO
        const paciente = pacientesMock[(dia * 3 + idx) % pacientesMock.length]
        slots.push({
          fecha: fechaStr, hora,
          disponible: false, bloqueado: false,
          turno: { id: dia * 100 + idx + 1, estado: 'CONFIRMADO', paciente },
        })
      } else if (seed === 2) {
        // Ocupado — CONCLUIDA
        const paciente = pacientesMock[(dia * 2 + idx + 1) % pacientesMock.length]
        slots.push({
          fecha: fechaStr, hora,
          disponible: false, bloqueado: false,
          turno: { id: dia * 100 + idx + 50, estado: 'CONCLUIDA', paciente },
        })
      } else {
        // Libre
        slots.push({ fecha: fechaStr, hora, disponible: true, bloqueado: false })
      }
    })
  }
  return slots
}