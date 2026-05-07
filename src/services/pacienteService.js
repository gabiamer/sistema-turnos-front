import axiosInstance from './axiosInstance';

export const pacienteService = {

    // GET /api/pacientes?ci=
    buscarPorCi: async (ci) => {
        const response = await axiosInstance.get(
            `/api/pacientes?ci=${ci}`
        );

        return response.data;
    },

    // POST /api/pacientes
    registrar: async (paciente) => {
        const response = await axiosInstance.post(
            '/api/pacientes',
            paciente
        );

        return response.data;
    }
};