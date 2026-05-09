// src/components/Header.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { FaShoppingBag } from "react-icons/fa";
import "./components.css";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { openLogin } = useUI()
  const navigate = useNavigate()

  const [open, setOpen]           = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Scroll behavior — glassmorphism intensifica no scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    navigate('/')
    setTimeout(() => {
      logout()
      setLoggingOut(false)
    }, 450)
  }

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <header className={`header${scrolled ? ' header-scrolled' : ''}${loggingOut ? ' header-logout-fade' : ''}`}>
      <div className="header-inner">
        <Link to={isAuthenticated ? '/perfil' : '/'} className="header-logo">
          INSIDER
        </Link>

        <nav className="header-catalog-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'header-link header-link-active' : 'header-link'}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'header-link header-link-active' : 'header-link'}>Produtos</NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? 'header-link header-link-active' : 'header-link'}>Categorias</NavLink>
        </nav>

        <nav className="header-nav">
          <Link to="/cart" className="header-link header-cart">
            <FaShoppingBag />
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/usuarios" className="header-link">
                    Usuários
                  </Link>
                  <Link to="/stock" className="header-link">
                    Estoque
                  </Link>
                </>
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
                    <button classNam