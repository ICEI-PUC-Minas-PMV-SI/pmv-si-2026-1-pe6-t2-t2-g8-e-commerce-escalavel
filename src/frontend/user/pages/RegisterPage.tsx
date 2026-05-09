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
  