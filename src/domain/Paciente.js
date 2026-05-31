// src/domain/Paciente.js
// Modelo de dominio — sin dependencias externas.

export class Paciente {
  constructor(dto) {
    Object.assign(this, dto)
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`
  }
}
