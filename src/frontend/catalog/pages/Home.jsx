import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
          <p className="text-xs tracking-[0.25em] uppercase text-gray-400">Nova Coleção</p>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none">
            Estilo que<br />fala por si.
          </h1>
          <p className="text-gray-500 text-lg max-w-md">
            Peças selecionadas para quem não abre mão de personalidade.
          </p>
        </div>
      </section>

      {/* Destaques */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Em destaque</h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-black transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {[
            { label: 'Novidades', desc: 'As últimas peças da temporada', to: '/products' },
            { label: 'Mais Vendidos', desc: 'O que todo mundo está usando', to: '/products' },
            { label: 'Categorias', desc: 'Explore por estilo', to: '/categories' },
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

      {/* Banner */}
      <section className="bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
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
        </div>
      </section>
    </main>
  )
}
