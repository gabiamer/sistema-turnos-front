// src/repositories/pacienteRepository.js
// Puerto de salida — abstrae el acceso a datos de Paciente.

import { pacienteService } from '../services/pacienteService'
import { pacienteAdapter } from '../adapters/pacienteAdapter'

export const pacienteRepository = {

  buscarPorCi: async (ci) => {
    const data = await pacienteService.buscarPorCi(ci)
    return pacienteAdapter.fromDTO(data)
  },

  registrar: async (datosPaciente) => {
    const data = await pacienteService.registrar(datosPaciente)
    return pacienteAdapter.fromDTO(data)
  },
}
