import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import AdminUsersPage from './pages/AdminUsersPage'

const UserRoutes = [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="cadastro" path="/cadastro" element={<RegisterPage />} />,
  <Route key="perfil" path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />,
  <Route key="perfil-editar" path="/perfil/editar" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />,
  <Route key="perfil-senha" path="/perfil/senha" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />,
  <Route key="admin-usuarios" path="/admin/usuarios" element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>} />,
]

export default UserRoutes
