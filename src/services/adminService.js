// src/services/adminService.js
import apiPersonal from './apiPersonal'

export const adminService = {

  getKpis: async (fecha) => {
    const params = fecha ? { fecha } : {}
    const { data } = await apiPersonal.get('/api/admin/kpis', { params })
    return data
  },

  getReporte: async (tipo, inicio, fin) => {
    const { data } = await apiPersonal.get(`/api/admin/reportes/${tipo}`, {
      params: { inicio, fin },
    })
    return data
  },

  exportarCSV: async (tipo, inicio, fin) => {
    const response = await apiPersonal.get('/api/admin/reportes/exportar', {
      params: { tipo, inicio, fin },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${tipo}-${inicio}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}