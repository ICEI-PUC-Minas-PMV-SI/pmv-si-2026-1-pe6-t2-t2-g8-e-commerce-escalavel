import { createContext, useContext, useState, ReactNode } from 'react'
import { userService, User } from '@/src/services/userService'
import { tokenStore } from '@/src/services/tokenStore'

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
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await userService.login({ email, password })
      tokenStore.set(res.token)
      setUserState(res.user)
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    cpf?: string,
    phone?: string,
  ) => {
    setLoading(true)
    try {
      const res = await userService.register({ name, email, password, cpf, phone })
      tokenStore.set(res.token)
      setUserState(res.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    tokenStore.clear()
    setUserState(null)
  }

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
