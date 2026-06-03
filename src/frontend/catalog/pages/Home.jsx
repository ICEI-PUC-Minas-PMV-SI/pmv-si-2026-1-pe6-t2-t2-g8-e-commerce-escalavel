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
            <Link to="/products" className="hero-cta-primary">
              Ver coleção
            </Link>
            {!user && (
              <Link to="/login" className="hero-cta-ghost">
                Entrar na conta
              </Link>
            )}
          </div>
        </div>

        {/* dots */}
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === slide ? ' hero-dot-on' : ''}`}
              style={i === slide ? { background: cur.accent } : {}}
              onClick={() => goSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* contador */}
        <div className="hero-counter">
          <span className="hero-counter-cur">{String(slide + 1).padStart(2, '0')}</span>
          <span className="hero-counter-sep">/</span>
          <span className="hero-counter-tot">{String(SLIDES.length).padStart(2, '0')}</span>
        </div>

        {/* seta scroll */}
        <div className="hero-scroll-hint">
          <span>↓</span>
        </div>
      </section>

      {/* ── DESTAQUES ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Em destaque</h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-black transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {[
            { label: 'Novidades',     desc: 'As últimas peças da temporada',  to: '/products' },
            { label: 'Mais Vendidos', desc: 'O que todo mundo está usando',    to: '/products' },
            { label: 'Categorias',    desc: 'Explore por estilo',              to: '/categories' },
          ].map(({ label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="bg-white p-10 flex flex-col gap-2 group hover:bg-black hover:text-white transition-colors duration-200"
            >
              <span className="text-xl font-semibold">{label}</span>
              <span className="text-sm text-gray-500 group-hover:text-gray-300">{desc}</span>
              <span className="mt-4 text-sm font-medium group-hover:text-white">Explorar →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BANNER CTA / BOAS-VINDAS ── */}
      <section className="bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          {user ? (
            <>
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-3">Insider</p>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Olá, {user.name.split(' ')[0]}.<br />
                  <span className="text-gray-300 text-2xl sm:text-3xl font-normal">O que você busca hoje?</span>
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/products"
                  className="border border-white text-white px-8 py-3 text-sm font-semibold tracking-wide hover:bg-white hover:text-black transition-colors text-center"
                >
                  Ver produtos
                </Link>
                <Link
                  to="/categories"
                  className="border border-gray-600 text-gray-300 px-8 py-3 text-sm font-semibold tracking-wide hover:border-white hover:text-white transition-colors text-center"
                >
                  Categorias
                </Link>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-3">Insider</p>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Crie sua conta<br />e aproveite mais.
                </h2>
              </div>
              <Link
                to="/cadastro"
                className="shrink-0 border border-white text-white px-10 py-3 text-sm font-semibold tracking-wide hover:bg-white hover:text-black transition-colors"
              >
                Criar conta grátis
              </Link>
            </>
          )}
        </div>
      </section>

    </main>
  )
}
