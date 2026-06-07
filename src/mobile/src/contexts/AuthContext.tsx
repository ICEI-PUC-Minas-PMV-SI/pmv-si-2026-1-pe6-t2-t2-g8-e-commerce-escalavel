import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '@/src/services/userService'

// AUTH DESABILITADA PARA TESTES — substitua pelo AuthProvider real quando o serviço de usuário estiver ok
const MOCK_USER: User = {
  id: 'mock-user-id',
  name: 'Admin Teste',
  email: 'admin@teste.com',
  role: 'admin',
  active: true,
  created_at: new Date().toISOString(),
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, cpf?: string, phone?: string) => Promise<void>
  logout: () => void
  setUser: (u: User) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(MOCK_USER)
  const [loading, setLoading] = useState(false)

  const login = async (_email: string, _password: string) => { /* mock */ }
  const register = async (_name: string, _email: string, _password: string) => { /* mock */ }
  const logout = () => setUserState(null)
  const setUser = (u: User) => setUserState(u)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
