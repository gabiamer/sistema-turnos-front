// src/services/agendaService.js
import axiosInstance from './axiosInstance';

export const agendaService = {

    // GET /api/medicos/{id}/agenda
    getByMedico: async (medicoId) => {
        const response = await axiosInstance.get(`/api/medicos/${medicoId}/agenda`);
        return response.data;
    },

    // PUT /api/medicos/{id}/agenda
    actualizarAgenda: async (medicoId, dias) => {
        const response = await axiosInstance.put(
            `/api/medicos/${medicoId}/agenda`,
            { dias }
        );
        return response.data;
    },

    // GET /api/medicos/{id}/bloqueos
    getBloqueos: async (medicoId) => {
        const response = await axiosInstance.get(`/api/medicos/${medicoId}/bloqueos`);
        return response.data;
    },

    // POST /api/medicos/{id}/bloqueos
    crearBloqueo: async (medicoId, bloqueo) => {
        const response = await axiosInstance.post(
            `/api/medicos/${medicoId}/bloqueos`,
            bloqueo
        );
        return response.data;
    },
};