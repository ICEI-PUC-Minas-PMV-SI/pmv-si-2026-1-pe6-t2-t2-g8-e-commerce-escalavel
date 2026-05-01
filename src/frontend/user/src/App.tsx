// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import AdminUsersPage from './pages/AdminUsersPage'

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />

        {/* Privadas */}
        <Route
          path="/perfil"
          element={<PrivateRoute><ProfilePage /></PrivateRoute>}
        />
        <Route
          path="/perfil/editar"
          element={<PrivateRoute><EditProfilePage /></PrivateRoute>}
        />
        <Route
          path="/perfil/senha"
          element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>}
        />

        {/* Admin */}
        <Route
          path="/admin/usuarios"
          element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
