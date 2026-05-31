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
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY)
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
