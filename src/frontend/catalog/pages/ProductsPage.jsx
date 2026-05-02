import { useEffect, useState } from 'react'
import { catalogApi } from '../../services/api'

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const EMPTY_FILTERS = { name: '', categoryId: '', minPrice: '', maxPrice: '' }

function getDisplayPrice(product) {
  const prices = (product.variants ?? [])
    .flatMap(v => v.skus ?? [])
    .map(s => s.price)
    .filter(p => typeof p === 'number')
  return prices.length ? Math.min(...prices) : null
}

function ProductCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false)
  const price = getDisplayPrice(product)

  return (
    <div className="bg-gray-800 text-white rounded-lg overflow-hidden flex flex-col">
      <div className="w-full h-40 bg-gray-700 flex-shrink-0">
        {product.urlImg && !imgFailed && (
          <img
            src={product.urlImg}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-lg font-semibold leading-tight mb-1">{product.name}</h2>
        {product.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          {price !== null ? (
            <span className="text-green-400 font-bold text-lg">
              A partir de {PRICE_FORMATTER.format(price)}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Sem estoque</span>
          )}
          {product.category?.name && (
            <span className="text-xs text-white-500 bg-gray-700 px-2 py-1 rounded-full">
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const fetchProducts = async (activeFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await catalogApi.getProducts(activeFilters)
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro ao carregar produtos. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    catalogApi.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
    fetchProducts(EMPTY_FILTERS)
  }, [])

  const handleFilter = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts(filters)
  }

  const handleClear = () => {
    setFilters(EMPTY_FILTERS)
    fetchProducts(EMPTY_FILTERS)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      <form onSubmit={handleSearch} className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1     sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilter}
            placeholder="Buscar por nome..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilter}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilter}
            placeholder="Preço mínimo"
            min="0"
            step="0.01"
            className="bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilter}
            placeholder="Preço máximo"
            min="0"
            step="0.01"
            className="bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded transition-colors"
          >
            Buscar
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium px-5 py-2 rounded transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </form>

      {!loading && !error && (
        <p className="text-sm text-gray-400 mb-4">{products.length} produto(s) encontrado(s)</p>
      )}

      {error && (
        <div className="bg-red-900 text-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchProducts(filters)}
            className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="bg-gray-700 h-40" />
              <div className="p-4">
                <div className="bg-gray-700 h-4 rounded w-3/4 mb-2" />
                <div className="bg-gray-700 h-3 rounded w-full mb-1" />
                <div className="bg-gray-700 h-3 rounded w-5/6 mb-3" />
                <div className="bg-gray-700 h-5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
