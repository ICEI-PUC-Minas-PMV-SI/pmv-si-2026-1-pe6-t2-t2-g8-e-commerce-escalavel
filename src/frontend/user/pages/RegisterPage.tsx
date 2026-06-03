// src/user/pages/RegisterPage.tsx
import { useState, FormEvent, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/* ── Máscaras ── */
function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

/* ── Ícones ── */
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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

/* ── Slides (mesmos do login) ── */
const SLIDES = [
  {
    tag: 'Novo por aqui?',
    headline: ['Crie sua', 'Conta'],
    sub: 'Acesse coleções exclusivas e acompanhe seus pedidos em tempo real.',
    bg: 'linear-gradient(145deg, #080810 0%, #141428 100%)',
    blob1: 'rgba(120,100,220,0.12)', blob2: 'rgba(80,60,180,0.06)',
    accent: '#a78bfa',
  },
  {
    tag: 'Premium',
    headline: ['Estilo', 'que Define'],
    sub: 'Peças selecionadas para quem exige o melhor em cada detalhe.',
    bg: 'linear-gradient(145deg, #0e0e0e 0%, #1a0f00 100%)',
    blob1: 'rgba(201,169,110,0.12)', blob2: 'rgba(160,120,50,0.06)',
    accent: '#C9A96E',
  },
  {
    tag: 'Limited',
    headline: ['Só para', 'Membros'],
    sub: 'Ofertas antecipadas, lançamentos e benefícios exclusivos para você.',
    bg: 'linear-gradient(145deg, #050810 0%, #0a1628 100%)',
    blob1: 'rgba(56,189,248,0.10)', blob2: 'rgba(14,165,233,0.05)',
    accent: '#38bdf8',
  },
]

/* ── Força de senha ── */
function pwdStrength(p: string) {
  if (!p)        return null
  if (p.length < 8)  return { level: 0, label: 'Fraca',  color: '#ef4444' }
  if (p.length < 12) return { level: 1, label: 'Média',  color: '#f59e0b' }
  if (/[^a-zA-Z0-9]/.test(p) && /[A-Z]/.test(p)) return { level: 3, label: 'Forte',  color: '#22c55e' }
  return               { level: 2, label: 'Boa',    color: '#84cc16' }
}

/* ── Validação step 1 ── */
function validateStep1(f: typeof initForm) {
  const errs: Partial<Record<keyof typeof initForm, string>> = {}
  if (!f.name.trim())             errs.name     = 'Nome obrigatório'
  else if (f.name.trim().length < 3) errs.name  = 'Mínimo 3 caracteres'
  if (!f.email)                   errs.email    = 'E-mail obrigatório'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = 'E-mail inválido'
  if (!f.password)                errs.password = 'Senha obrigatória'
  else if (f.password.length < 8) errs.password = 'Mínimo 8 caracteres'
  return errs
}

const initForm = { name: '', email: '', password: '', cpf: '', phone: '', street: '', city: '', state: '', zip: '' }

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  /* slides */
  const [slide, setSlide]     = useState(0)
  const [visible, setVisible] = useState(true)

  /* multi-step */
  const [step, setStep]       = useState<1 | 2>(1)
  const [dir, setDir]         = useState<'fwd' | 'back'>('fwd')
  const [animating, setAnim]  = useState(false)

  /* form */
  const [form, setForm]       = useState(initForm)
  const [touched, setTouched] = useState<Partial<Record<keyof typeof initForm, boolean>>>({})
  const [submitted1, setSub1] = useState(false)
  const [showPass, setShowPass] = useState(false)

  /* API */
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  /* autoplay slides */
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

  const set = (field: keyof typeof initForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setApiError('')
    }
  const blur = (field: keyof typeof initForm) => () =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const errs1 = validateStep1(form)
  const fieldErr = (f: keyof typeof initForm) =>
    (submitted1 || touched[f]) ? (errs1[f as keyof typeof errs1] ?? '') : ''
  const fieldOk = (f: keyof typeof initForm) =>
    touched[f] && !errs1[f as keyof typeof errs1]

  const transitionStep = (next: 1 | 2, direction: 'fwd' | 'back') => {
    setDir(direction)
    setAnim(true)
    setTimeout(() => { setStep(next); setAnim(false) }, 220)
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setSub1(true)
    if (Object.keys(errs1).length > 0) return
    transitionStep(2, 'fwd')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    const address = form.street || form.city
      ? { street: form.street, city: form.city, state: form.state, zip: form.zip }
      : undefined
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        cpf: form.cpf || undefined, phone: form.phone || undefined, address,
      })
      setSuccess(true)
      setTimeout(() => navigate('/perfil'), 1100)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const strength = pwdStrength(form.password)
  const cur = SLIDES[slide]
  const slideClass = animating ? (dir === 'fwd' ? ' rg2-exit-fwd' : ' rg2-exit-back') : ' rg2-enter'

  return (
    <div className="lv2-root">

      {/* ══ PAINEL ESQUERDO ══ */}
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
              <button key={i} className={`lv2-dot${i === slide ? ' lv2-dot-on' : ''}`}
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

      {/* ══ PAINEL DIREITO ══ */}
      <div className="lv2-right rg2-right">
        <div className="lv2-card rg2-card">

          {success ? (
            <div className="lv2-success">
              <div className="lv2-success-ring">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="lv2-success-title">Conta criada!</p>
              <p className="lv2-success-sub">Bem-vindo à INSIDER.</p>
            </div>
          ) : (
            <>
              {/* cabeçalho */}
              <div className="lv2-head rg2-head">
                <p className="lv2-eyebrow">Cadastro</p>
                <h1 className="lv2-title">Criar conta</h1>
                <p className="lv2-desc">Preencha os dados abaixo para começar</p>
              </div>

              {/* indicador de etapas */}
              <div className="rg2-steps">
                <div className="rg2-step-track">
                  <div className={`rg2-step-node${step >= 1 ? ' rg2-step-done' : ''}`}>
                    {step > 1 ? <IconCheck /> : '1'}
                  </div>
                  <div className={`rg2-step-line${step >= 2 ? ' rg2-step-line-done' : ''}`} />
                  <div className={`rg2-step-node${step >= 2 ? ' rg2-step-done' : ' rg2-step-pending'}`}>
                    2
                  </div>
                </div>
                <div className="rg2-step-labels">
                  <span className={step === 1 ? 'rg2-lbl-active' : 'rg2-lbl'}>Dados pessoais</span>
                  <span className={step === 2 ? 'rg2-lbl-active' : 'rg2-lbl'}>Endereço</span>
                </div>
              </div>

              {/* erro API */}
              {apiError && (
                <div className="lv2-api-error" style={{ marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {apiError}
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className={`rg2-step-content${slideClass}`}>
                  <form onSubmit={handleNext} noValidate className="rg2-form">

                    {/* Nome */}
                    <div className={`lv2-field${fieldErr('name') ? ' lv2-field-error' : ''}${fieldOk('name') ? ' lv2-field-ok' : ''}`}>
                      <label className="lv2-label" htmlFor="rg-name">Nome completo</label>
                      <div className="lv2-input-wrap">
                        <input ref={nameRef} id="rg-name" type="text" className="lv2-input"
                          placeholder="Seu nome completo" value={form.name}
                          onChange={set('name')} onBlur={blur('name')} autoComplete="name" />
                        {fieldOk('name')  && <span className="lv2-status lv2-ok"><IconCheck /></span>}
                        {fieldErr('name') && <span className="lv2-status lv2-err">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>}
                      </div>
                      {fieldErr('name') && <p className="lv2-error-msg">{fieldErr('name')}</p>}
                    </div>

                    {/* E-mail */}
                    <div className={`lv2-field${fieldErr('email') ? ' lv2-field-error' : ''}${fieldOk('email') ? ' lv2-field-ok' : ''}`}>
                      <label className="lv2-label" htmlFor="rg-email">E-mail</label>
                      <div className="lv2-input-wrap">
                        <input id="rg-email" type="email" className="lv2-input"
                          placeholder="seu@email.com" value={form.email}
                          onChange={set('email')} onBlur={blur('email')} autoComplete="email" />
                        {fieldOk('email')  && <span className="lv2-status lv2-ok"><IconCheck /></span>}
                        {fieldErr('email') && <span className="lv2-status lv2-err">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>}
                      </div>
                      {fieldErr('email') && <p className="lv2-error-msg">{fieldErr('email')}</p>}
                    </div>

                    {/* Senha */}
                    <div className={`lv2-field${fieldErr('password') ? ' lv2-field-error' : ''}${fieldOk('password') ? ' lv2-field-ok' : ''}`}>
                      <label className="lv2-label" htmlFor="rg-pass">Senha</label>
                      <div className="lv2-input-wrap">
                        <input id="rg-pass" type={showPass ? 'text' : 'password'}
                          className="lv2-input lv2-input-icon"
                          placeholder="Mínimo 8 caracteres" value={form.password}
                          onChange={set('password')} onBlur={blur('password')}
                          autoComplete="new-password" />
                        {fieldOk('password')  && <span className="lv2-status lv2-ok" style={{ right: 44 }}><IconCheck /></span>}
                        {fieldErr('password') && <span className="lv2-status lv2-err" style={{ right: 44 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>}
                        <button type="button" className="lv2-eye" onClick={() => setShowPass(v => !v)}
                          tabIndex={-1} aria-label={showPass ? 'Ocultar' : 'Ver senha'}>
                          {showPass ? <IconEyeOff /> : <IconEyeOpen />}
                        </button>
                      </div>
                      {fieldErr('password') && <p className="lv2-error-msg">{fieldErr('password')}</p>}
                      {strength && !fieldErr('password') && (
                        <div className="rg2-strength">
                          <div className="rg2-bars">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className="rg2-bar"
                                style={{ background: i <= strength.level ? strength.color : '#e5e7eb' }} />
                            ))}
                          </div>
                          <span className="rg2-str-label" style={{ color: strength.color }}>
                            {strength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CPF + Telefone */}
                    <div className="rg2-row">
                      <div className="lv2-field">
                        <label className="lv2-label" htmlFor="rg-cpf">CPF <span className="rg2-opt">(opcional)</span></label>
                        <input id="rg-cpf" type="text" className="lv2-input"
                          placeholder="000.000.000-00" value={form.cpf}
                          onChange={e => setForm(prev => ({ ...prev, cpf: maskCPF(e.target.value) }))} />
                      </div>
                      <div className="lv2-field">
                        <label className="lv2-label" htmlFor="rg-phone">Telefone <span className="rg2-opt">(opcional)</span></label>
                        <input id="rg-phone" type="text" className="lv2-input"
                          placeholder="(00) 00000-0000" value={form.phone}
                          onChange={e => setForm(prev => ({ ...prev, phone: maskPhone(e.target.value) }))} />
                      </div>
                    </div>

                    <button type="submit" className="lv2-submit rg2-submit">
                      <span>Continuar</span> <IconArrow />
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className={`rg2-step-content${slideClass}`}>
                  <form onSubmit={handleSubmit} noValidate className="rg2-form">

                    <p className="rg2-optional-note">
                      Endereço é opcional — você pode pular e adicionar depois.
                    </p>

                    {/* Rua */}
                    <div className="lv2-field">
                      <label className="lv2-label" htmlFor="rg-street">Rua / Logradouro</label>
                      <input id="rg-street" type="text" className="lv2-input"
                        placeholder="Rua das Flores, 123" value={form.street} onChange={set('street')} />
                    </div>

                    {/* Cidade + Estado */}
                    <div className="rg2-row">
                      <div className="lv2-field" style={{ flex: 2 }}>
                        <label className="lv2-label" htmlFor="rg-city">Cidade</label>
                        <input id="rg-city" type="text" className="lv2-input"
                          placeholder="Belo Horizonte" value={form.city} onChange={set('city')} />
                      </div>
                      <div className="lv2-field" style={{ flex: 1 }}>
                        <label className="lv2-label" htmlFor="rg-state">UF</label>
                        <input id="rg-state" type="text" className="lv2-input"
                          placeholder="MG" maxLength={2} value={form.state} onChange={set('state')} />
                      </div>
                    </div>

                    {/* CEP */}
                    <div className="lv2-field">
                      <label className="lv2-label" htmlFor="rg-zip">CEP</label>
                      <input id="rg-zip" type="text" className="lv2-input"
                        placeholder="00000-000" value={form.zip} onChange={set('zip')} />
                    </div>

                    {/* Ações */}
                    <div className="rg2-actions">
                      <button type="button" className="rg2-back-btn"
                        onClick={() => transitionStep(1, 'back')}>
                        <IconBack /> Voltar
                      </button>
                      <button type="submit" className="lv2-submit rg2-submit rg2-submit-flex"
                        disabled={loading}>
                        {loading
                          ? <><span className="btn-spinner" /> Criando…</>
                          : <><span>Criar conta</span> <IconArrow /></>}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <p className="lv2-footer" style={{ marginTop: 20 }}>
                Já tem conta?{' '}
                <Link to="/login" className="lv2-link">Entrar</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
