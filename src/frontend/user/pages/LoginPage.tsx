// src/user/pages/LoginPage.tsx
import { useState, useEffect, FormEvent, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/* ── Ícones inline ── */
const IconEyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

/* ── Slides ── */
const SLIDES = [
  {
    tag: 'SS 2026',
    headline: ['Nova', 'Coleção'],
    sub: 'Tendências exclusivas selecionadas para o seu estilo único.',
    bg: 'linear-gradient(145deg, #080810 0%, #141428 100%)',
    blob1: 'rgba(120,100,220,0.12)',
    blob2: 'rgba(80,60,180,0.06)',
    accent: '#a78bfa',
  },
  {
    tag: 'Premium',
    headline: ['Estilo', 'que Define'],
    sub: 'Peças selecionadas para quem exige o melhor em cada detalhe.',
    bg: 'linear-gradient(145deg, #0e0e0e 0%, #1a0f00 100%)',
    blob1: 'rgba(201,169,110,0.12)',
    blob2: 'rgba(160,120,50,0.06)',
    accent: '#C9A96E',
  },
  {
    tag: 'Limited',
    headline: ['Exclu', 'sividade'],
    sub: 'Cada detalhe pensado com precisão absoluta e dedicação.',
    bg: 'linear-gradient(145deg, #050810 0%, #0a1628 100%)',
    blob1: 'rgba(56,189,248,0.1)',
    blob2: 'rgba(14,165,233,0.05)',
    accent: '#38bdf8',
  },
]

/* ── Validação ── */
function validateEmail(v: string) {
  if (!v) return 'E-mail obrigatório'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido'
  return ''
}
function validatePassword(v: string) {
  if (!v) return 'Senha obrigatória'
  if (v.length < 6) return 'Mínimo 6 caracteres'
  return ''
}

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  /* slides */
  const [slide, setSlide]     = useState(0)
  const [visible, setVisible] = useState(true)

  /* form */
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [passBlurred, setPassBlurred]   = useState(false)

  /* API */
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [shake, setShake]         = useState(false)
  const [success, setSuccess]     = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)

  /* erros de validação */
  const emailErr = (submitted || emailBlurred) ? validateEmail(email) : ''
  const passErr  = (submitted || passBlurred)  ? validatePassword(password) : ''
  const emailOk  = (submitted || emailBlurred) && !validateEmail(email)
  const passOk   = (submitted || passBlurred)  && !validatePassword(password)

  useEffect(() => { emailRef.current?.focus() }, [])
  useEffect(() => { if (isAuthenticated) navigate('/perfil') }, [isAuthenticated, navigate])
  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setVisible(true) }, 420)
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  const goSlide = (i: number) => {
    if (i === slide) return
    setVisible(false)
    setTimeout(() => { setSlide(i); setVisible(true) }, 350)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (validateEmail(email) || validatePassword(password)) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    setApiError('')
    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/perfil'), 800)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  const cur = SLIDES[slide]

  return (
    <div className="lv2-root">
      <div className="lv2-left" style={{ background: cur.bg }}>
        <div className="lv2-blob lv2-blob-a" style={{ background: cur.blob1 }} />
        <div className="lv2-blob lv2-blob-b" style={{ background: cur.blob2 }} />
        <div className="lv2-grid" />
        <div className="lv2-brand">
          <span className="lv2-brand-text">INSIDER</span>
          <span className="lv2-brand-dot" style={{ background: cur.accent }} />
        </div>
        <div className={`lv2-slide${visible ? ' lv2-slide-in' : ' lv2-slide-out'}`}>
          <span className="lv2-tag" style={{ color: cur.accent, borderColor: cur.accent }}>{cur.tag}</span>
          <h2 className="lv2-headline">
            {cur.headline.map((l, i) => <span key={i}>{l}</span>)}
          </h2>
          <p className="lv2-sub">{cur.sub}</p>
          <div className="lv2-line" style={{ background: cur.accent }} />
        </div>
        <div className="lv2-nav">
          <div className="lv2-dots">
            {SLIDES.map((_, i) => (
              <button key={i} type="button" className={`lv2-dot${i === slide ? ' lv2-dot-on' : ''}`}
                style={i === slide ? { background: cur.accent, width: 28 } : {}}
                onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <span className="lv2-counter">
            <b>{String(slide + 1).padStart(2, '0')}</b>
            <span className="lv2-counter-sep"> / </span>
            {String(SLIDES.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="lv2-right">
        <div className={`lv2-card${shake ? ' lv2-shake' : ''}`}>
          {success ? (
            <div className="lv2-success">
              <IconCheck />
              <p>Bem-vindo de volta!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h1 className="lv2-title">Entrar</h1>
              <p className="lv2-subtitle">Acesse sua conta</p>

              {apiError && <div className="lv2-error"><IconX /> {apiError}</div>}

              <div className="lv2-field">
                <label className="lv2-label">E-mail</label>
                <input
                  ref={emailRef}
                  type="email"
                  className={`lv2-input${emailErr ? ' lv2-input-err' : ''}${emailOk ? ' lv2-input-ok' : ''}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setApiError('') }}
                  onBlur={() => setEmailBlurred(true)}
                  autoComplete="email"
                />
                {emailErr && <span className="lv2-msg-err">{emailErr}</span>}
              </div>

              <div className="lv2-field">
                <label className="lv2-label">Senha</label>
                <div className="lv2-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`lv2-input${passErr ? ' lv2-input-err' : ''}${passOk ? ' lv2-input-ok' : ''}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setApiError('') }}
                    onBlur={() => setPassBlurred(true)}
                    autoComplete="current-password"
                  />
                  <button type="button" className="lv2-eye" onClick={() => setShowPass(s => !s)} aria-label="Mostrar senha">
                    {showPass ? <IconEyeOff /> : <IconEyeOpen />}
                  </button>
                </div>
                {passErr && <span className="lv2-msg-err">{passErr}</span>}
              </div>

              <button type="submit" className="lv2-submit" disabled={loading}>
                {loading ? 'Entrando...' : <>Entrar <IconArrow /></>}
              </button>

              <p className="lv2-footer">
                Novo por aqui?{' '}
                <Link to="/cadastro" className="lv2-link">Criar conta</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
 