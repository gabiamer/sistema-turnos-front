// src/adapters/pacienteAdapter.js
// Adaptador de salida — transforma DTOs del backend en modelos de dominio Paciente.

import { Paciente } from '../domain/Paciente'

export const pacienteAdapter = {
  fromDTO:     (dto)  => new Paciente(dto),
  listFromDTO: (dtos) => (Array.isArray(dtos) ? dtos.map(dto => new Paciente(dto)) : []),
}
