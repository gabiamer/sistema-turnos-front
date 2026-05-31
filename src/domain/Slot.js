// src/domain/Slot.js
// Modelo de dominio para un slot de agenda (disponibilidad o agenda-semana).
// Sin dependencias externas.

export class Slot {
  constructor(dto) {
    Object.assign(this, dto)
  }

  get tieneTurno() {
    return !!this.turno
  }

  get estaLibre() {
    return this.disponible && !this.bloqueado && !this.turno
  }

  get estaOcupado() {
    return !this.disponible || !!this.turno
  }
}
