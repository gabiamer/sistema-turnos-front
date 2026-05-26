import axiosInstance from './axiosInstance'

export const medicoService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/medicos')
    return response.data
  },
}
