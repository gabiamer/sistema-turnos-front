// src/data/mockData.js
// ============================================================
// Sprint 1 — feature/luci-s1-calendario
// Estructura real según contratos de API definidos con Ana y Alex
// Cuando lleguen los endpoints reales, SOLO se cambia la fuente de datos,
// NO los componentes.
// ============================================================

// GET /api/medicos  →  [{ id, nombre, apellido, especialidad, email }]
export const mockMedicos = [
  { id: 1, nombre: 'Carlos',  apellido: 'Romero',   especialidad: 'Cardiología',     email: 'cromero@clinica.com'   },
  { id: 2, nombre: 'Valeria', apellido: 'Pinto',    especialidad: 'Pediatría',       email: 'vpinto@clinica.com'    },
  { id: 3, nombre: 'Luis',    apellido: 'Aranda',   especialidad: 'Traumatología',   email: 'laranda@clinica.com'   },
  { id: 4, nombre: 'Sofía',   apellido: 'Guzmán',   especialidad: 'Dermatología',    email: 'sguzman@clinica.com'   },
  { id: 5, nombre: 'Marco',   apellido: 'Villalba', especialidad: 'Cardiología',     email: 'mvillalba@clinica.com' },
  { id: 6, nombre: 'Elena',   apellido: 'Castro',   especialidad: 'Clínica General', email: 'ecastro@clinica.com'   },
]

// GET /api/medicos?especialidad=Cardiología  →  mismo shape
export const mockEspecialidades = [
  'Cardiología',
  'Pediatría',
  'Traumatología',
  'Dermatología',
  'Clínica General',
]

// GET /api/medicos/{id}/disponibilidad?semana=YYYY-MM-DD
// → { medicoId, semana, slots: [{ fecha, hora, disponible, bloqueoActivo }] }
// Esta función genera slots de ejemplo para cualquier médico y semana
export function generarSlotsMock(medicoId, fechaLunes) {
  const horas = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  ]

  const slots = []
  for (let dia = 0; dia < 5; dia++) {         // lunes a viernes
    const fecha = new Date(fechaLunes)
    fecha.setDate(fecha.getDate() + dia)
    const fechaStr = fecha.toISOString().split('T')[0]

    horas.forEach((hora, idx) => {
      // patrón determinista para que los mocks sean estables entre renders
      const seed        = (medicoId * 7 + dia * 5 + idx * 3) % 4
      const disponible   = seed !== 0
      const bloqueoActivo = seed === 2
      slots.push({ fecha: fechaStr, hora, disponible, bloqueoActivo })
    })
  }
  return slots
}

// GET /api/turnos?pacienteId={id}
// → [{ id, fecha, hora, estado, medico: { nombre, apellido, especialidad } }]
export const mockTurnos = [
  {
    id: 101,
    fecha: '2026-05-27',
    hora: '09:00',
    estado: 'CONFIRMADO',
    medico: { nombre: 'Carlos', apellido: 'Romero', especialidad: 'Cardiología' },
  },
  {
    id: 102,
    fecha: '2026-06-03',
    hora: '14:30',
    estado: 'PENDIENTE',
    medico: { nombre: 'Valeria', apellido: 'Pinto', especialidad: 'Pediatría' },
  },
  {
    id: 103,
    fecha: '2026-05-15',
    hora: '10:00',
    estado: 'CANCELADO',
    medico: { nombre: 'Luis', apellido: 'Aranda', especialidad: 'Traumatología' },
  },
]