// src/components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  adminOnly?: boolean
}

export default function PrivateRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <div className="loading">Carregando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
