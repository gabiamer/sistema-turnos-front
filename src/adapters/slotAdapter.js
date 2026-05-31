// src/adapters/slotAdapter.js
// Adaptador de salida — transforma DTOs de slots (disponibilidad / agenda-semana)
// en modelos de dominio Slot.

import { Slot } from '../domain/Slot'

export const slotAdapter = {
  fromDTO:     (dto)  => new Slot(dto),
  listFromDTO: (dtos) => (Array.isArray(dtos) ? dtos.map(dto => new Slot(dto)) : []),
}
