import { Navigate } from 'react-router-dom'
import { personalStore } from '../store/personalStore'

// Protege rutas del personal hospitalario.
// roles: array de roles permitidos, ej: ['SECRETARIA']
export default function ProtectedRoute({ children, roles }) {
  const personal = personalStore.get()
  if (!personal) return <Navigate to="/login-personal" replace />
  if (roles && !roles.includes(personal.rol)) return <Navigate to="/login-personal" replace />
  return children
}
