import { FormEvent, useEffect, useState } from 'react'
import { createStockItem, type StockItem } from '../../services/stockClientService'
import { catalogApi } from '../../services/api'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (item: StockItem) => void
}

interface Variant { id: string; color: string; skus?: Sku[] }
interface Sku { id: string; size: string; code: string; price: number }
interface Product { id: string; name: string; variants?: Variant[] }

const PRICE_FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CreateStockModal({ open, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null)

  const [quantity, setQuantity] = useState('0')
  const [costPrice, setCostPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoadingProducts(true)
    catalogApi.getProducts()
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError('Erro ao carregar produtos.'))
      .finally(() => setLoadingProducts(false))
  }, [open])

  const reset = () => {
    setSelectedProduct(null)
    setSelectedVariant(null)
    setSelectedSku(null)
    setQuantity('0')
    setCostPrice('0')
    setError(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSelectProduct = async (productId: string) => {
    setSelectedVariant(null)
    setSelectedSku(null)
    setError(null)
    if (!productId) { setSelectedProduct(null); return }
    try {
      const full: Product = await catalogApi.getProductById(productId)
      setSelectedProduct(full)
    } catch {
      setError('Erro ao carregar variantes do produto.')
    }
  }

  const handleSelectVariant = (variantId: string) => {
    setSelectedSku(null)
    const v = selectedProduct?.variants?.find(v => v.id === variantId) ?? null
    setSelectedVariant(v)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedSku) { setError('Selecione um SKU.'); return }
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 0) { setError('Quantidade deve ser inteiro ≥ 0.'); return }
    const cost = Number(costPrice)
    if (!Number.isFinite(cost) || cost < 0) { setError('Custo deve ser ≥ 0.'); return }

    setSubmitting(true)
    try {
      const item = await createStockItem({ skuId: selectedSku.id, quantity: qty, costPrice: cost })
      onCreated(item)
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar item.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const inputCls = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
  const labelCls = "block text-xs font-medium text-gray-700"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Novo item de estoque</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">

          {/* Produto */}
          <div>
            <label className={labelCls}>Produto *</label>
            <select
              className={inputCls}
              value={selectedProduct?.id ?? ''}
              onChange={e => handleSelectProduct(e.target.value)}
              disabled={loadingProducts}
            >
              <option value="">{loadingProducts ? 'Carregando...' : 'Selecionar produto'}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Variante (cor) */}
          {selectedProduct && (
            <div>
              <label className={labelCls}>Cor (variante) *</label>
              {(selectedProduct.variants ?? []).length === 0 ? (
                <p className="mt-1 text-xs text-gray-400 italic">Este produto não tem variantes.</p>
              ) : (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {selectedProduct.variants?.map(v => {
                    const isSelected = selectedVariant?.id === v.id
                    const isHex = v.color?.startsWith('#')
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v.id)}
                        title={v.color}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          isSelected ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={isHex ? { backgroundColor: v.color } : { backgroundColor: '#e5e7eb' }}
                        />
                        {v.color}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* SKU (tamanho) */}
          {selectedVariant && (
            <div>
              <label className={labelCls}>Tamanho (SKU) *</label>
              {(selectedVariant.skus ?? []).length === 0 ? (
                <p className="mt-1 text-xs text-gray-400 italic">Esta variante não tem SKUs.</p>
              ) : (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {selectedVariant.skus?.map(sku => {
                    const isSelected = selectedSku?.id === sku.id
                    return (
                      <button
                        key={sku.id}
                        type="button"
                        onClick={() => setSelectedSku(sku)}
                        className={`px-3 py-1.5 border text-xs font-medium transition-all ${
                          isSelected ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {sku.size}
                        <span className="ml-1.5 opacity-60">{sku.code}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Resumo do SKU selecionado */}
          {selectedSku && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              <span><span className="font-semibold">Produto:</span> {selectedProduct?.name}</span>
              <span><span className="font-semibold">Cor:</span> {selectedVariant?.color}</span>
              <span><span className="font-semibold">Tam:</span> {selectedSku.size}</span>
              <span><span className="font-semibold">Cód:</span> {selectedSku.code}</span>
              <span><span className="font-semibold">Preço venda:</span> {PRICE_FMT.format(selectedSku.price)}</span>
            </div>
          )}

          {/* Quantidade e custo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Quantidade inicial</label>
              <input type="number" min="0" step="1" value={quantity}
                onChange={e => setQuantity(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Custo unitário (R$)</label>
              <input type="number" min="0" step="0.01" value={costPrice}
                onChange={e => setCostPrice(e.target.value)} className={inputCls} />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={handleClose} disabled={submitting}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting || !selectedSku}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
