import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const EMPTY_FORM = { name: '', description: '' }

function CategoryModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const firstRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name ?? '', description: initial.description ?? '' } : EMPTY_FORM)
      setError(null)
      setTimeout(() => firstRef.current?.focus(), 50)
    }
  }, [open, initial])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg tracking-tight">
            {initial ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input ref={firstRef} name="name" value={form.name} onChange={handleChange}
              placeholder="Nome da categoria" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Descrição da categoria" rows={3}
              className={inputClass + " resize-none"} />
          </div>
          {error && (
            <p className="text-red-600 text-sm border border-red-200 bg-red-50 px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white text-sm font-semibold py-2.5 hover:bg-gray-900 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar categoria'}
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

function ConfirmModal({ open, onConfirm, onClose, categoryName }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-sm mx-4 px-6 py-6">
        <h2 className="font-bold text-lg mb-2">Deletar categoria</h2>
        <p className="text-gray-500 text-sm mb-6">
          Tem certeza que deseja deletar <strong className="text-black">"{categoryName}"</strong>? Essa ação não pode ser desfeita.
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

export default function CategoriesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    catalogApi.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setError('Erro ao carregar categorias.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (formData) => {
    if (editTarget) {
      const updated = await catalogApi.updateCategory(editTarget.id, formData)
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
    } else {
      const created = await catalogApi.createCategory(formData)
      setCategories(prev => [created, ...prev])
    }
  }

  const handleDelete = async () => {
    await catalogApi.deleteCategory(deleteTarget.id)
    setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (cat) => { setEditTarget(cat); setModalOpen(true) }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-1">Catálogo</p>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            className="bg-black text-white text-sm font-semibold px-5 py-2.5 hover:bg-gray-900 transition-colors">
            + Nova Categoria
          </button>
        )}
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 p-4 text-sm mb-6">{error}</div>
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
            <div key={cat.id} className="bg-white p-10 flex flex-col gap-2 group relative hover:bg-gray-50 transition-colors duration-200">
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)}
                    className="bg-white border border-gray-200 text-xs font-semibold px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-colors">
                    Editar
                  </button>
                  <button onClick={() => setDeleteTarget(cat)}
                    className="bg-white border border-red-200 text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
                    Deletar
                  </button>
                </div>
              )}
              <Link to={`/products?categoryId=${cat.id}`} className="flex flex-col gap-2">
                <span className="text-xl font-semibold">{cat.name}</span>
                {cat.description && (
                  <span className="text-sm text-gray-500 line-clamp-2">{cat.description}</span>
                )}
                <span className="mt-4 text-sm font-medium">Ver produtos →</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        categoryName={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
