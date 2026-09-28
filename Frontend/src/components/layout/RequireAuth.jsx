import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Protege as telas do organizador: quem não fez login é mandado para a tela de login
export function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}
