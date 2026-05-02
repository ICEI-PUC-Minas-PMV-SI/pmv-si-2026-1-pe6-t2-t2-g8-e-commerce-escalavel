import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import CatalogRoutes from './catalog/CatalogRoutes'
import UserRoutes from './user/UserRoutes'
import OrderRoutes from './Order/OrderRoutes'

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        {CatalogRoutes}
        {UserRoutes}
        {OrderRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
