import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { userService, User } from '@/src/services/userService'
import { tokenStore } from '@/src/services/tokenStore'
import { authStorage } from '@/src/services/authStorage'

const AUTH_STORAGE_KEY = 'auth'

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
  // loading = true durante o bootstrap (re-hidratação do storage no mount).
  const [loading, setLoading] = useState(true)

  // Re-hidrata sessão salva ao montar. Token in-memory (tokenStore) é a fonte
  // sync usada nos headers; o storage só persiste entre reloads/restarts.
  useEffect(() => {
    (async () => {
      try {
        const raw = await authStorage.getItem(AUTH_STORAGE_KEY)
        if (raw) {
          const { token, user: savedUser } = JSON.parse(raw) as { token: string; user: User }
          if (token) {
            tokenStore.set(token)
            setUserState(savedUser)
          }
        }
      } catch {
        // storage indisponível / JSON corrompido — começa deslogado.
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const persistSession = async (token: string, u: User) => {
    try {
      await authStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: u }))
    } catch {
      // falha de escrita — sessão segue em memória até o próximo reload.
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await userService.login({ email, password })
      tokenStore.set(res.token)
      setUserState(res.user)
      await persistSession(res.token, res.user)
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
      await persistSession(res.token, res.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    tokenStore.clear()
    setUserState(null)
    authStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {})
  }

  const setUser = (u: User) => {
    setUserState(u)
    const token = tokenStore.get()
    if (token) persistSession(token, u)
  }

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
