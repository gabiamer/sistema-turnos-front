// Guarda en sessionStorage el personal logueado (secretaria, médico, admin)
// El paciente NO usa este store, sigue usando sessionStorage('paciente') directamente

const STORAGE_KEY = 'personal'

const getStored = () => {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) } catch { return null }
}

export const personalStore = {
  get: () => getStored(),

  login: (personal) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(personal))
    // Patrón Observer: notifica a los suscriptores de la misma pestaña
    // (el evento 'storage' nativo solo se dispara entre pestañas distintas)
    window.dispatchEvent(new Event('storage'))
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('storage'))
  },

  isLoggedIn: () => !!getStored(),

  getRol: () => getStored()?.rol || null,

  getMedicoId: () => {
    try {
      const raw = sessionStorage.getItem('sesion')
      if (!raw) return null
      const s = JSON.parse(raw)
      return s?.rol === 'MEDICO' ? s.id : null
    } catch { return null }
  },

}
