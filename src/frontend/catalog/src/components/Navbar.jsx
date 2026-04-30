import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `text-sm font-medium transition-colors hover:text-white ${
      pathname === path ? 'text-white border-b-2 border-blue-500 pb-0.5' : 'text-gray-400'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-lg tracking-widest uppercase hover:text-blue-400 transition-colors">
          Insider
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/products" className={linkClass('/products')}>Produtos</Link>
          <Link to="/categories" className={linkClass('/categories')}>Categorias</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
