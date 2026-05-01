import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './user/pages/LoginPage'
import RegisterPage from './user/pages/RegisterPage'
import ProfilePage from './user/pages/ProfilePage'
import EditProfilePage from './user/pages/EditProfilePage'
import ChangePasswordPage from './user/pages/ChangePasswordPage'
import AdminUsersPage from './user/pages/AdminUsersPage'
import Home from './catalog/pages/Home'
import ProductsPage from './catalog/pages/ProductsPage'
import CategoriesPage from './catalog/pages/CategoriesPage'
export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/perfil/editar" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
        <Route path="/perfil/senha" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
        <Route path="/admin/usuarios" element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
