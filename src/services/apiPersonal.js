import axios from 'axios'

// Instancia de axios que agrega X-User-Role automáticamente en cada request.
// Usar este cliente en secretariaService.js y adminService.js

const apiPersonal = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

apiPersonal.interceptors.request.use((config) => {
  try {
    const personal = JSON.parse(sessionStorage.getItem('personal'))
    if (personal?.rol) {
      config.headers['X-User-Role'] = personal.rol
    }
  } catch {}
  return config
})

export default apiPersonal
