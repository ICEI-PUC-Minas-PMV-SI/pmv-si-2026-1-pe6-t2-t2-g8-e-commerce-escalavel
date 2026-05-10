import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SLIDES = [
  {
    tag: 'SS 2026',
    headline: 'Nova\nColeção',
    sub: 'Tendências exclusivas para o seu estilo',
    bg: 'linear-gradient(145deg, #080808 0%, #1c1c2e 100%)',
    shape1: 'rgba(255,255,255,0.04)',
    shape2: 'rgba(255,255,255,0.02)',
    accent: '#ffffff',
  },
  {
    tag: 'Premium',
    headline: 'Estilo\nque Define',
    sub: 'Peças selecionadas para quem exige o melhor',
    bg: 'linear-gradient(145deg, #0e0e0e 0%, #1a0f00 100%)',
    shape1: 'rgba(201,169,110,0.09)',
    shape2: 'rgba(201,169,110,0.04)',
    accent: '#C9A96E',
  },
  {
    tag: 'Limited',
    headline: 'Exclu\nsividade',
    sub: 'Cada detalhe pensado com precisão absoluta',
    bg: 'linear-gradient(145deg, #050608 0%, #0a1628 100%)',
    shape1: 'rgba(120,160,220,0.08)',
    shape2: 'rgba(120,160,220,0.04)',
    accent: '#90b8e0',
  },
]

export default function Home() {
  const { user } = useAuth()
  const [slide, setSlide]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setVisible(true) }, 450)
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  const goSlide = (i) => {
    if (i === slide) return
    setVisible(false)
    setTimeout(() => { setSlide(i); setVisible(true) }, 350)
  }

  const cur = SLIDES[slide]

  return (
    <main>

      {/* ── HERO ANIMADO ── */}
      <section className="hero-root" style={{ background: cur.bg }}>

        {/* blobs */}
        <div className="hero-blob hero-blob-1" style={{ background: cur.shape1 }} />
        <div className="hero-blob hero-blob-2" style={{ background: cur.shape2 }} />
        <div className="hero-blob hero-blob-3" style={{ background: cur.shape1 }} />

        {/* grid animado */}
        <div className="hero-grid" />

        {/* marca */}
        <div className="hero-brand">INSIDER</div>

        {/* texto ambiente gigante */}
        <div
          className={`hero-ambient${visible ? ' hero-ambient-in' : ' hero-ambient-out'}`}
          aria-hidden="true"
        >
          {cur.headline.split('\n').map((line, i) => (
            <span key={i} className="hero-ambient-line">{line}</span>
          ))}
        </div>

        {/* tag + subtítulo + CTA */}
        <div className={`hero-info${visible ? ' hero-info-in' : ' hero-info-out'}`}>
          <span className="hero-tag" style={{ color: cur.accent, borderColor: cur.accent }}>
            — {cur.tag}
          </span>
          <p className="hero-sub">{cur.sub}</p>
          <div className="hero-line" style={{ background: cur.accent }} />
          <div className="hero-cta-row">
            <Link to="/products" className="hero-cta-primary">Ver coleção</Link>
            {!user && <Link to="/cadastro" className="hero-cta-ghost">Criar conta</Link>}
          </div>
        </div>
      </section>
    </main>
  )
}
