// src/contexts/UIContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface UIContextValue {
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
}

const UIContext = createContext<UIContextValue>({} as UIContextValue)

export function UIProvider({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const location = useLocation()

  // fecha o modal ao mudar de rota
  useEffect(() => {
    setLoginOpen(false)
  }, [location.pathname])

  // ESC fecha
  useEffect(() => {
    if (!loginOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLoginOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [loginOpen])

  const openLogin  = useCallback(() => setLoginOpen(true),  [])
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  return (
    <UIContext.Provider value={{ loginOpen, openLogin, closeLogin }}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
