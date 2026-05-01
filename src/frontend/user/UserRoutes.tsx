import { Route } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import AdminUsersPage from './pages/AdminUsersPage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'

import PrivateRoute from '../components/PrivateRoute'

export default function UserRoutes() {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/perfil/editar" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
      <Route path="/perfil/senha" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
      <Route path="/admin/usuarios" element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>} />
    </>
  )
}
