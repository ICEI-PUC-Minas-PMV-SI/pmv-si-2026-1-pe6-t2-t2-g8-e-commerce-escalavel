import { Routes } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import { UIProvider } from './contexts/UIContext'
import { CartProvider } from './contexts/CartContext'

import Header from './components/Header'
import LoginModal from './user/components/LoginModal'

import CatalogRoutes from './catalog/CatalogRoutes'
import UserRoutes from './user/UserRoutes'
import OrderRoutes from './Order/OrderRoutes'

import StockRoutes from './stock/StockRoutes'
import NotificationRoutes from './notification/NotificationRoutes'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <UIProvider>
          <Header />
          <LoginModal />

          <Routes>
            {CatalogRoutes}
            {UserRoutes}
            {OrderRoutes}
            {StockRoutes}
            {NotificationRoutes}
          </Routes>
        </UIProvider>
      </CartProvider>
    </AuthProvider>
  )
}
