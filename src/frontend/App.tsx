import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UIProvider } from './contexts/UIContext'
import Header from './components/Header'
import LoginModal from './user/components/LoginModal'
import CatalogRoutes from './catalog/CatalogRoutes'
import UserRoutes from './user/UserRoutes'
import OrderRoutes from './Order/OrderRoutes'
import StockRoutes from './stock/StockRoutes'

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Header />
        <LoginModal />
        <Routes>
          {CatalogRoutes}
          {UserRoutes}
          {OrderRoutes}
          {StockRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UIProvider>
    </AuthProvider>
  )
}
