// src/components/Header.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen]           = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    setLoggingOut(true)
    setTimeout(() => {
      logout()
      setLoggingOut(false)
      navigate('/login')
    }, 450)
  }

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <header className={`header${loggingOut ? ' header-logout-fade' : ''}`}>
      <div className="header-inner">
        <Link to={isAuthenticated ? '/perfil' : '/'} className="header-logo">
          INSIDER
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin/usuarios" className="header-link">
                  Usuários
                </Link>
              )}

              <div className="hd-menu" ref={menuRef}>
                <button
                  className="hd-trigger"
                  onClick={() => setOpen(v => !v)}
                  aria-expanded={open}
                >
                  <span className="hd-avatar">{initials}</span>
                  <span className="hd-name">{user?.name.split(' ')[0]}</span>
                  <span className={`hd-chevron${open ? ' hd-chevron-open' : ''}`}>▾</span>
                </button>

                {open && (
                  <div className="hd-dropdown">
                    <div className="hd-user-info">
                      <span className="hd-user-name">{user?.name}</span>
                      <span className="hd-user-email">{user?.email}</span>
                    </div>
                    <div className="hd-sep" />
                    <Link to="/perfil" className="hd-item" onClick={() => setOpen(false)}>
                      Minha Conta
                    </Link>
                    <Link to="/perfil/editar" className="hd-item" onClick={() => setOpen(false)}>
                      Editar Perfil
                    </Link>
                    <Link to="/perfil/senha" className="hd-item" onClick={() => setOpen(false)}>
                      Alterar Senha
                    </Link>
                    <div className="hd-sep" />
                    <button className="hd-item hd-item-danger" onClick={handleLogout}>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">Entrar</Link>
              <Link to="/cadastro" className="header-btn">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
