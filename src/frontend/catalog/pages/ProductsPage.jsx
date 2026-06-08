import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { resolveImageUri } from '../../shared/helpers/imageResolver'

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const EMPTY_FILTERS = { name: '', categoryId: '', minPrice: '', maxPrice: '' }
const EMPTY_FORM = { name: '', description: '', urlImg: '', categoryId: '', active: true }

const PRESET_COLORS = [
  '#000000','#FFFFFF','#F44336','#E91E63','#9C27B0','#673AB7',
  '#3F51B5','#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50',
  '#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800','#FF5722',
  '#795548','#607D8B','#9E9E9E','#B0BEC5','#FFB3BA','#FFDFBA',
  '#FFFFBA','#BAFFC9','#BAE1FF','#D4A5A5','#A8D8EA','#AA96DA',
]
const EMPTY_SKU = { size: '', code: '', price: '' }

function getDisplayPrice(product) {
  const prices = (product.variants ?? [])
    .flatMap(v => v.skus ?? [])
    .map(s => s.price)
    .filter(p => typeof p === 'number')
  return prices.length ? Math.min(...prices) : null
}

// ── Variant Modal ──────────────────────────────────────────────────────────
function VariantModal({ open, onClose, product }) {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // novo variante
  const [showNewVariant, setShowNewVariant] = useState(false)
  const [newColor, setNewColor] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  // novo SKU por variante { [variantId]: { size, code, price } }
  const [skuForms, setSkuForms] = useState({})

  // edição de SKU existente { [skuId]: { size, code, price } | null }
  const [editSkuForms, setEditSkuForms] = useState({})

  const loadVariants = async () => {
    if (!product) return
    setLoading(true)
    try {
      const data = await catalogApi.getProductById(product.id)
      setVariants(data.variants ?? [])
      setError(null)
    } catch {
      setError('Erro ao carregar variantes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && product) {
      setShowNewVariant(false)
      setNewColor('')
      setSkuForms({})
      setEditSkuForms({})
      setError(null)
      loadVariants()
    }
  }, [open, product?.id])

  const handleAddVariant = async () => {
    if (!newColor.trim()) { setError('Informe a cor.'); return }
    setBusy(true); setError(null)
    try {
      await catalogApi.createVariant(product.id, { color: newColor.trim() })
      setNewColor(''); setShowNewVariant(false); setShowPicker(false)
      await loadVariants()
    } catch (err) {
      setError(err.message ?? 'Erro ao criar variante.')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Deletar esta variante e todos os SKUs?')) return
    setBusy(true); setError(null)
    try {
      await catalogApi.deleteVariant(variantId)
      await loadVariants()
    } catch (err) {
      setError(err.message ?? 'Erro ao deletar variante.')
    } finally {
      setBusy(false)
    }
  }

  const handleAddSku = async (variantId) => {
    const form = skuForms[variantId] ?? EMPTY_SKU
    if (!form.size.trim()) { setError('Informe o tamanho.'); return }
    if (!form.code.trim()) { setError('Informe o código.'); return }
    if (!form.price || Number(form.price) < 0) { setError('Informe um preço válido.'); return }
    setBusy(true); setError(null)
    try {
      await catalogApi.createSku(variantId, {
        size: form.size.trim(),
        code: form.code.trim().toUpperCase(),
        price: Number(form.price),
      })
      setSkuForms(prev => ({ ...prev, [variantId]: null }))
      await loadVariants()
    } catch (err) {
      setError(err.message ?? 'Erro ao criar SKU.')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteSku = async (skuId) => {
    if (!window.confirm('Deletar este SKU?')) return
    setBusy(true); setError(null)
    try {
      await catalogApi.deleteSku(skuId)
      await loadVariants()
    } catch (err) {
      setError(err.message ?? 'Erro ao deletar SKU.')
    } finally {
      setBusy(false)
    }
  }

  const openEditSku = (sku) =>
    setEditSkuForms(prev => ({ ...prev, [sku.id]: { size: sku.size, code: sku.code, price: String(sku.price) } }))

  const cancelEditSku = (skuId) =>
    setEditSkuForms(prev => ({ ...prev, [skuId]: null }))

  const updateEditSkuForm = (skuId, field, value) =>
    setEditSkuForms(prev => ({ ...prev, [skuId]: { ...prev[skuId], [field]: value } }))

  const handleUpdateSku = async (skuId) => {
    const form = editSkuForms[skuId]
    if (!form?.size?.trim()) { setError('Informe o tamanho.'); return }
    if (!form?.code?.trim()) { setError('Informe o código.'); return }
    if (!form?.price || Number(form.price) < 0) { setError('Informe um preço válido.'); return }
    setBusy(true); setError(null)
    try {
      await catalogApi.updateSku(skuId, {
        size: form.size.trim(),
        code: form.code.trim().toUpperCase(),
        price: Number(form.price),
      })
      cancelEditSku(skuId)
      await loadVariants()
    } catch (err) {
      setError(err.message ?? 'Erro ao atualizar SKU.')
    } finally {
      setBusy(false)
    }
  }

  const updateSkuForm = (variantId, field, value) =>
    setSkuForms(prev => ({ ...prev, [variantId]: { ...(prev[variantId] ?? EMPTY_SKU), [field]: value } }))

  const inputCls = "border border-gray-200 bg-white text-black placeholder-gray-400 px-2.5 py-1.5 text-sm focus:outline-none focus:border-black transition-colors"

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-lg tracking-tight">Variantes</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">×</button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
          {error && (
            <p className="text-red-600 text-sm border border-red-200 bg-red-50 px-3 py-2">{error}</p>
          )}

          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Carregando...</div>
          ) : variants.length === 0 && !showNewVariant ? (
            <p className="text-gray-400 text-sm italic">Nenhuma variante. Adicione uma cor abaixo.</p>
          ) : (
            variants.map(variant => (
              <div key={variant.id} className="border border-gray-100 rounded">
                {/* cabeçalho da variante */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300 inline-block shrink-0"
                      style={{ backgroundColor: variant.color?.startsWith('#') ? variant.color : undefined }}
                    />
                    <span className="font-semibold text-sm">{variant.color}</span>
                    <span className="text-xs text-gray-400">{variant.skus?.length ?? 0} SKU(s)</span>
                  </div>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    disabled={busy}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-0.5 hover:border-red-500 transition-colors disabled:opacity-40"
                  >
                    Deletar variante
                  </button>
                </div>

                {/* SKUs existentes */}
                <div className="px-4 py-3 flex flex-col gap-2">
                  {(variant.skus ?? []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Nenhum SKU.</p>
                  )}
                  {(variant.skus ?? []).map(sku => {
                    const editing = !!editSkuForms[sku.id]
                    const editForm = editSkuForms[sku.id]
                    return editing ? (
                      /* ── formulário de edição inline ── */
                      <div key={sku.id} className="border border-black/10 bg-gray-50 px-3 py-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500">Editar SKU</p>
                        <div className="flex gap-2 items-end flex-wrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Tamanho *</span>
                            <input value={editForm.size} onChange={e => updateEditSkuForm(sku.id, 'size', e.target.value)}
                              className={inputCls + " w-20"} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Código *</span>
                            <input value={editForm.code} onChange={e => updateEditSkuForm(sku.id, 'code', e.target.value)}
                              className={inputCls + " w-28"} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Preço *</span>
                            <input type="number" min="0" step="0.01" value={editForm.price}
                              onChange={e => updateEditSkuForm(sku.id, 'price', e.target.value)}
                              className={inputCls + " w-24"} />
                          </div>
                          <button onClick={() => handleUpdateSku(sku.id)} disabled={busy}
                            className="bg-black text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-900 disabled:opacity-50 transition-colors">
                            Salvar
                          </button>
                          <button onClick={() => cancelEditSku(sku.id)}
                            className="text-xs text-gray-500 hover:text-black px-2 py-1.5 transition-colors">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── linha de exibição ── */
                      <div key={sku.id} className="flex items-center justify-between text-xs border border-gray-100 px-3 py-2 bg-white">
                        <div className="flex gap-4">
                          <span><span className="text-gray-400">Tam:</span> <strong>{sku.size}</strong></span>
                          <span><span className="text-gray-400">Cód:</span> <strong>{sku.code}</strong></span>
                          <span><span className="text-gray-400">Preço:</span> <strong>{PRICE_FORMATTER.format(sku.price)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditSku(sku)}
                            disabled={busy}
                            className="text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-black px-2 py-0.5 transition-colors disabled:opacity-40"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSku(sku.id)}
                            disabled={busy}
                            className="text-red-400 hover:text-red-600 disabled:opacity-40 text-lg leading-none"
                          >×</button>
                        </div>
                      </div>
                    )
                  })}

                  {/* form novo SKU */}
                  {skuForms[variant.id] ? (
                    <div className="flex gap-2 items-end mt-1 flex-wrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Tamanho *</span>
                        <input value={skuForms[variant.id]?.size ?? ''} onChange={e => updateSkuForm(variant.id, 'size', e.target.value)}
                          placeholder="M" className={inputCls + " w-20"} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Código *</span>
                        <input value={skuForms[variant.id]?.code ?? ''} onChange={e => updateSkuForm(variant.id, 'code', e.target.value)}
                          placeholder="SKU-001" className={inputCls + " w-28"} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Preço *</span>
                        <input type="number" min="0" step="0.01" value={skuForms[variant.id]?.price ?? ''} onChange={e => updateSkuForm(variant.id, 'price', e.target.value)}
                          placeholder="99.90" className={inputCls + " w-24"} />
                      </div>
                      <button onClick={() => handleAddSku(variant.id)} disabled={busy}
                        className="bg-black text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-900 disabled:opacity-50 transition-colors">
                        Salvar SKU
                      </button>
                      <button onClick={() => setSkuForms(prev => ({ ...prev, [variant.id]: null }))}
                        className="text-xs text-gray-500 hover:text-black px-2 py-1.5 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => updateSkuForm(variant.id, 'size', '')}
                      className="text-xs text-gray-500 hover:text-black border border-dashed border-gray-300 hover:border-black px-3 py-1.5 mt-1 w-fit transition-colors">
                      + Adicionar SKU
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* form nova variante */}
          {showNewVariant ? (
            <div className="border border-dashed border-gray-300 rounded p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase text-gray-500">Nova variante</p>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Cor (hex ou nome) *</span>
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-7 h-7 rounded border border-gray-300 shrink-0 cursor-pointer"
                      style={{ backgroundColor: newColor || '#E5E7EB' }}
                      onClick={() => setShowPicker(p => !p)}
                    />
                    <input value={newColor} onChange={e => setNewColor(e.target.value)}
                      placeholder="#FF0000 ou vermelho" className={inputCls + " w-48"} />
                  </div>
                </div>
              </div>

              {/* paleta */}
              {showPicker && (
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map(hex => (
                    <button
                      key={hex}
                      onClick={() => { setNewColor(hex); setShowPicker(false) }}
                      className={`w-7 h-7 rounded border transition-all ${newColor === hex ? 'border-black border-2' : 'border-gray-300'}`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleAddVariant} disabled={busy}
                  className="bg-black text-white text-sm font-semibold px-4 py-1.5 hover:bg-gray-900 disabled:opacity-50 transition-colors">
                  {busy ? 'Salvando...' : 'Criar variante'}
                </button>
                <button onClick={() => { setShowNewVariant(false); setNewColor(''); setShowPicker(false) }}
                  className="text-sm text-gray-500 hover:text-black px-3 py-1.5 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewVariant(true)}
              className="border border-dashed border-gray-300 hover:border-black text-sm text-gray-500 hover:text-black font-medium py-2.5 w-full transition-colors">
              + Nova variante (cor)
            </button>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button onClick={onClose}
            className="bg-black text-white text-sm font-semibold px-6 py-2 hover:bg-gray-900 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
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
function ProductCard({ product, isAdmin, onEdit, onDelete, onVariants }) {
  const [imgFailed, setImgFailed] = useState(false)
  const price = getDisplayPrice(product)
  const productLink = product?.id ? `/products/${product.id}` : '/products'
  const resolvedImg = resolveImageUri(product?.urlImg)

  return (
    <Link to={productLink} className="group flex flex-col border border-gray-100 hover:border-black transition-colors duration-200 relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product) }}
            className="bg-white border border-gray-200 text-xs font-semibold px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-colors">
            Editar
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVariants(product) }}
            className="bg-white border border-gray-200 text-xs font-semibold px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-colors">
            Variantes
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product) }}
            className="bg-white border border-red-200 text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
            Deletar
          </button>
        </div>
      )}

      <div className="w-full aspect-square bg-gray-50 overflow-hidden">
        {resolvedImg && !imgFailed ? (
          <img src={resolvedImg} alt={product.name}
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
    </Link>
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
  const [variantTarget, setVariantTarget] = useState(null)

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
  const openVariants = (product) => setVariantTarget(product)

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
              onVariants={openVariants}
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

      <VariantModal
        open={!!variantTarget}
        onClose={() => setVariantTarget(null)}
        product={variantTarget}
      />
    </div>
  )
}
