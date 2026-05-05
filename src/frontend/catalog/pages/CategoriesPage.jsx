import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogApi } from '../../services/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    catalogApi.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setError('Erro ao carregar categorias.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-1">Catálogo</p>
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-100 p-10 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="bg-white p-10 flex flex-col gap-2 group hover:bg-black hover:text-white transition-colors duration-200"
            >
              <span className="text-xl font-semibold">{cat.name}</span>
              {cat.description && (
                <span className="text-sm text-gray-500 group-hover:text-gray-300 line-clamp-2">
                  {cat.description}
                </span>
              )}
              <span className="mt-4 text-sm font-medium group-hover:text-white">
                Ver produtos →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
