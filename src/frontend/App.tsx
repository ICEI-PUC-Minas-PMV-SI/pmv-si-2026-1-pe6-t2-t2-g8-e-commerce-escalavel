import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import CatalogRoutes from './catalog/CatalogRoutes'
import UserRoutes from './user/UserRoutes'

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <CatalogRoutes />
        <UserRoutes />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
