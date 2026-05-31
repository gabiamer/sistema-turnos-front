// src/domain/Medico.js
// Modelo de dominio — sin dependencias externas.

export class Medico {
  constructor(dto) {
    Object.assign(this, dto)
  }

  get nombreCompleto() {
    return `Dr. ${this.nombre} ${this.apellido}`
  }
}
