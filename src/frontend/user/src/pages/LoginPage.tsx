// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)
  const [success, setSuccess]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/perfil'), 700)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className={`auth-card auth-card-animate${shake ? ' auth-shake' : ''}`}>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <p className="auth-success-text">Bem-vindo de volta!</p>
          </div>
        ) : (
          <>
            <div className="auth-brand">INSIDER</div>
            <h1 className="auth-title">Entrar</h1>
            <p className="auth-subtitle">Acesse sua conta</p>

            {error && (
              <div className="alert alert-error alert-animate">
                <span className="alert-icon">✕</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <div className="input-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input input-with-icon"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading
                  ? <><span className="btn-spinner" /> Entrando...</>
                  : 'Entrar'}
              </button>
            </form>

            <p className="auth-footer">
              Não tem conta?{' '}
              <Link to="/cadastro" className="link">Criar conta</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
