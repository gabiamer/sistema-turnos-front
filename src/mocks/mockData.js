// src/mocks/mockData.js

export const especialidades = [
  'Todas',
  'Cardiología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
  'Traumatología',
  'Clínica General',
]

export const medicos = [
  {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Mendoza',
    especialidad: 'Cardiología',
    email: 'c.mendoza@hospital.com',
  },
  {
    id: 2,
    nombre: 'Ana',
    apellido: 'Torres',
    especialidad: 'Dermatología',
    email: 'a.torres@hospital.com',
  },
  {
    id: 3,
    nombre: 'Luis',
    apellido: 'García',
    especialidad: 'Pediatría',
    email: 'l.garcia@hospital.com',
  },
  {
    id: 4,
    nombre: 'María',
    apellido: 'Rodríguez',
    especialidad: 'Ginecología',
    email: 'm.rodriguez@hospital.com',
  },
  {
    id: 5,
    nombre: 'Jorge',
    apellido: 'Vargas',
    especialidad: 'Traumatología',
    email: 'j.vargas@hospital.com',
  },
  {
    id: 6,
    nombre: 'Sofía',
    apellido: 'López',
    especialidad: 'Clínica General',
    email: 's.lopez@hospital.com',
  },
]

export const slots = [
  { id: 1, medicoId: 1, fecha: '2025-06-10', hora: '08:00', disponible: true,  bloqueoActivo: false },
  { id: 2, medicoId: 1, fecha: '2025-06-10', hora: '09:00', disponible: false, bloqueoActivo: false },
  { id: 3, medicoId: 1, fecha: '2025-06-10', hora: '10:00', disponible: true,  bloqueoActivo: false },
  { id: 4, medicoId: 1, fecha: '2025-06-11', hora: '08:00', disponible: true,  bloqueoActivo: true  },
  { id: 5, medicoId: 1, fecha: '2025-06-11', hora: '09:00', disponible: true,  bloqueoActivo: false },
  { id: 6, medicoId: 2, fecha: '2025-06-10', hora: '10:00', disponible: true,  bloqueoActivo: false },
  { id: 7, medicoId: 2, fecha: '2025-06-10', hora: '11:00', disponible: false, bloqueoActivo: false },
  { id: 8, medicoId: 3, fecha: '2025-06-12', hora: '14:00', disponible: true,  bloqueoActivo: false },
  { id: 9, medicoId: 3, fecha: '2025-06-12', hora: '15:00', disponible: true,  bloqueoActivo: true  },
]

export const pacientes = [
  {
    id: 1,
    ci: '12345678',
    nombre: 'Pedro',
    apellido: 'Suárez',
    fechaNacimiento: '1985-03-15',
    telefono: '70012345',
    email: 'pedro.suarez@mail.com',
  },
]

export const turnos = [
  {
    id: 1,
    pacienteId: 1,
    medicoId: 1,
    slotId: 1,
    fecha: '2025-06-10',
    hora: '09:00',
    estado: 'confirmado',
  },
]