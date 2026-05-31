// src/services/adminService.js
import axiosInstance from './axiosInstance'

const ROL_HEADER = { 'X-User-Role': 'ADMINISTRATIVO' }

export const adminService = {

  // GET /api/admin/kpis?fecha=YYYY-MM-DD
  getKpis: async (fecha) => {
    const params = fecha ? { fecha } : {}
    const { data } = await axiosInstance.get('/api/admin/kpis', {
      params,
      headers: ROL_HEADER,
    })
    return data
  },

  // GET /api/admin/reportes/{tipo}?inicio=&fin=
  getReporte: async (tipo, inicio, fin) => {
    const { data } = await axiosInstance.get(`/api/admin/reportes/${tipo}`, {
      params: { inicio, fin },
      headers: ROL_HEADER,
    })
    return data
  },

  // GET /api/admin/reportes/exportar?tipo=&inicio=&fin= → descarga CSV
  exportarCSV: async (tipo, inicio, fin) => {
    const response = await axiosInstance.get('/api/admin/reportes/exportar', {
      params: { tipo, inicio, fin },
      headers: ROL_HEADER,
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