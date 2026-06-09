// src/user/components/LoginModal.tsx
import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUI } from '../../contexts/UIContext'

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginModal() {
  const { login } = useAuth()
  const { loginOpen, closeLogin } = useUI()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)
  const [success, setSuccess]   = useState(false)

  // reset ao fechar
  useEffect(() => {
    if (!loginOpen) {
      setTimeout(() => {
        setEmail(''); setPassword(''); setError('')
        setShowPass(false); setSuccess(false)
      }, 300)
    }
  }, [loginOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => { closeLogin(); navigate('/perfil') }, 900)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.')
      setShake(true)
      setTimeout(() => setShake(false), 520)
    } finally {
      setLoading(false)
    }
  }

  if (!loginOpen) return null

  return (
    <div className="lm-overlay" onClick={e => { if (e.target === e.currentTarget) closeLogin() }}>
      <div className={`lm-card${shake ? ' auth-shake' : ''}`} role="dialog" aria-modal="true">

        <button className="lm-close" onClick={closeLogin} aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <p className="auth-success-text">Bem-vindo de volta!</p>
          </div>
        ) : (
          <>
            <div className="lm-header">
              <span className="lm-eyebrow">Bem-vindo</span>
              <h2 className="lm-title">Entrar</h2>
              <p className="lm-desc">Acesse sua conta OUTSIDER</p>
            </div>

            {error && (
              <div className="alert alert-error alert-animate">
                <span className="alert-icon">✕</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="lm-form">

              <div className="lm-field">
                <label className="lm-label">Email</label>
                <input
                  type="email"
                  className="lm-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="lm-field">
                <label className="lm-label">Senha</label>
                <div className="lm-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="lm-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lm-eye"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Ocultar' : 'Ver senha'}
                  >
                    {showPass ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="lm-submit"
                disabled={loading}
              >
                {loading ? <><span className="btn-spinner" /> Entrando...</> : 'Entrar'}
              </button>
            </form>

            <p className="lm-footer">
              Não tem conta?{' '}
              <Link to="/cadastro" className="lm-link" onClick={closeLogin}>
                Criar conta
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
