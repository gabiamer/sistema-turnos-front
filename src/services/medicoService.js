import axiosInstance from './axiosInstance';

export const medicoService = {

    // GET /api/medicos
    getAll: async () => {
        const response = await axiosInstance.get('/api/medicos');
        return response.data;
    },

    // GET /api/medicos/{id}
    getById: async (id) => {
        const response = await axiosInstance.get(`/api/medicos/${id}`);
        return response.data;
    },

    // GET /api/medicos?especialidad=
    getByEspecialidad: async (especialidad) => {
        const response = await axiosInstance.get(
            `/api/medicos?especialidad=${especialidad}`
        );
        return response.data;
    }
};