// src/domain/Turno.js
// Modelo de dominio — capa central de la arquitectura hexagonal.
// No depende de frameworks ni de HTTP; solo expresa reglas de negocio.

export class Turno {
  constructor(dto) {
    Object.assign(this, dto)
    // El backend puede devolver turnoId (solicitar) o id (listar/agenda)
    this.id = dto.turnoId ?? dto.id
  }

  get esCancelable() {
    return ['CONFIRMADO', 'PENDIENTE', 'BLOQUEADO'].includes(this.estado)
  }

  get esConcluidable() {
    return this.estado === 'CONFIRMADO'
  }

  get esReprogramable() {
    return this.estado === 'CONFIRMADO'
  }

  get nombrePaciente() {
    if (!this.paciente) return null
    return `${this.paciente.nombre} ${this.paciente.apellido}`
  }

  get nombreMedico() {
    if (!this.medico) return null
    return `Dr. ${this.medico.nombre} ${this.medico.apellido}`
  }
}
