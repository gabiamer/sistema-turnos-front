// src/adapters/medicoAdapter.js
// Adaptador de salida — transforma DTOs del backend en modelos de dominio Medico.

import { Medico } from '../domain/Medico'

export const medicoAdapter = {
  fromDTO:     (dto)  => new Medico(dto),
  listFromDTO: (dtos) => (Array.isArray(dtos) ? dtos.map(dto => new Medico(dto)) : []),
}
