// src/adapters/turnoAdapter.js
// Adaptador de salida — transforma DTOs del backend en modelos de dominio Turno.
// Aísla el dominio de la forma concreta en que el backend devuelve los datos.

import { Turno } from '../domain/Turno'

export const turnoAdapter = {
  fromDTO:      (dto)  => new Turno(dto),
  listFromDTO:  (dtos) => (Array.isArray(dtos) ? dtos.map(dto => new Turno(dto)) : []),
}
