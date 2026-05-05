import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const EMPTY_FILTERS = { name: '', categoryId: '', minPrice: '', maxPrice: '' }
const EMPTY_FORM = { name: '', description: '', urlImg: '', categoryId: '', active: true }

function getDisplayPrice(product) {
  const prices = (product.variants ?? [])
    .flatMap(v => v.skus ?? [])
    .map(s => s.price)
    .filter(p => typeof p === 'number')
  return prices.length ? Math.min(...prices) : null
}

// ── Modal ──────────────────────────────────────────────────────────────────
function ProductModal({ open, onClose, onSave, categories, initial }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const firstRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name ?? '',
        description: initial.description ?? '',
        urlImg: initial.urlImg ?? '',
        categoryId: initial.category?.id ?? '',
        active: initial.active ?? true,
      } : EMPTY_FORM)
      setError(null)
      setTimeout(() => firstRef.current?.focus(), 50)
    }
  }, [open, initial])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...form,
        categoryId: form.categoryId || null,
      })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "border border-gray-200 bg-white text-black placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors w-full"
  const labelClass = "block text-xs font-semibold tracking-wide uppercase text-gray-500 mb-1"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg tracking-tight">
            {initial ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input ref={firstRef} name="name" value={form.name} onChange={handleChange}
              placeholder="Nome do produto" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Descrição do produto" rows={3}
              className={inputClass + " resize-none"} />
          </div>

          <div>
            <label className={labelClass}>URL da imagem</label>
            <input name="urlImg" value={form.urlImg} onChange={handleChange}
              placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Categoria</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange}
              className="w-4 h-4 accent-black" />
            <span className="text-sm font-medium">Produto ativo</span>
          </label>

          {error && (
            <p className="text-red-600 text-sm border border-red-200 bg-red-50 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white text-sm font-semibold py-2.5 hover:bg-gray-900 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar produto'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 border border-gray-200 text-sm font-medium hover:border-black transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Confirmação de delete ──────────────────────────────────────────────────
function ConfirmModal({ open, onConfirm, onClose, productName }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-sm mx-4 px-6 py-6">
        <h2 className="font-bold text-lg mb-2">Deletar produto</h2>
        <p className="text-gray-500 text-sm mb-6">
          Tem certeza que deseja deletar <strong className="text-black">"{productName}"</strong>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className="flex-1 bg-black text-white text-sm font-semibold py-2.5 hover:bg-gray-900 transition-colors">
            Deletar
          </button>
          <button onClick={onClose}
            className="px-6 border border-gray-200 text-sm font-medium hover:border-black transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card de produto ────────────────────────────────────────────────────────
function ProductCard({ product, isAdmin, onEdit, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false)
  const price = getDisplayPrice(product)

  return (
    <div className="group flex flex-col border border-gray-100 hover:border-black transition-colors duration-200 relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => onEdit(product)}
            className="bg-white border border-gray-200 text-xs font-semibold px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-colors">
            Editar
          </button>
          <button onClick={() => onDelete(product)}
            className="bg-white border border-red-200 text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
            Deletar
          </button>
        </div>
      )}

      <div className="w-full aspect-square bg-gray-50 overflow-hidden">
        {product.urlImg && !imgFailed ? (
          <img src={product.urlImg} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">◻</div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.category?.name && (
          <span className="text-xs tracking-widest uppercase text-gray-400">{product.category.name}</span>
        )}
        <h2 className="font-semibold text-sm leading-snug">{product.name}</h2>
        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mt-0.5">{product.description}</p>
        )}
        <div className="mt-auto pt-3">
          {price !== null ? (
            <span className="font-bold text-sm">A partir de {PRICE_FORMATTER.format(price)}</span>
          ) : (
            <span className="text-gray-400 text-xs">Indisponível</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    categoryId: searchParams.get('categoryId') ?? '',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

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
    fetchProducts(filters)
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
    const cleared = EMPTY_FILTERS
    setFilters(cleared)
    fetchProducts(cleared)
  }

  const handleSave = async (formData) => {
    if (editTarget) {
      const updated = await catalogApi.updateProduct(editTarget.id, formData)
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
    } else {
      const created = await catalogApi.createProduct(formData)
      setProducts(prev => [created, ...prev])
    }
  }

  const handleDelete = async () => {
    await catalogApi.deleteProduct(deleteTarget.id)
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (product) => { setEditTarget(product); setModalOpen(true) }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')
  const inputClass = "border border-gray-200 bg-white text-black placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors w-full"

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-1">Catálogo</p>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            className="bg-black text-white text-sm font-semibold px-5 py-2.5 hover:bg-gray-900 transition-colors">
            + Novo Produto
          </button>
        )}
      </div>

      {/* Filtros */}
      <form onSubmit={handleSearch} className="border border-gray-100 p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input type="text" name="name" value={filters.name} onChange={handleFilter}
            placeholder="Buscar por nome..." className={inputClass} />
          <select name="categoryId" value={filters.categoryId} onChange={handleFilter} className={inputClass}>
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilter}
            placeholder="Preço mínimo" min="0" step="0.01" className={inputClass} />
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilter}
            placeholder="Preço máximo" min="0" step="0.01" className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button type="submit"
            className="bg-black text-white text-sm font-semibold px-6 py-2 hover:bg-gray-900 transition-colors">
            Filtrar
          </button>
          {hasActiveFilters && (
            <button type="button" onClick={handleClear}
              className="border border-gray-200 text-gray-600 text-sm font-medium px-6 py-2 hover:border-black hover:text-black transition-colors">
              Limpar
            </button>
          )}
        </div>
      </form>

      {!loading && !error && (
        <p className="text-xs text-gray-400 mb-6 tracking-wide">
          {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 mb-6 flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={() => fetchProducts(filters)}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 transition-colors">
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">Nenhum produto encontrado.</p>
          {hasActiveFilters && (
            <button onClick={handleClear} className="mt-3 text-sm underline text-black">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categories={categories}
        initial={editTarget}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        productName={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
