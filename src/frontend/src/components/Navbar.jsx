import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/products" className="hover:text-blue-400">Produtos</Link>
          <Link to="/categories" className="hover:text-blue-400">Categorias</Link>
       </nav>
  )
}

export default Navbar