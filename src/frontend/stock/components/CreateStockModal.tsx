import { FormEvent, useState } from 'react'
import { createStockItem, type StockItem } from '../../services/stockClientService'

const UUID_RE = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (item: StockItem) => void
}

export default function CreateStockModal({ open, onClose, onCreated }: Props) {
  const [skuId, setSkuId] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [costPrice, setCostPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const reset = () => {
    setSkuId('')
    setQuantity('0')
    setCostPrice('0')
    setError(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = skuId.trim()
    if (!UUID_RE.test(trimmed)) {
      setError('SKU inválido. Informe um UUID.')
      return
    }
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 0) {
      setError('Quantidade inicial deve ser inteiro ≥ 0.')
      return
    }
    const cost = Number(costPrice)
    if (!Number.isFinite(cost) || cost < 0) {
      setError('Custo deve ser ≥ 0.')
      return
    }

    setSubmitting(true)
    try {
      const item = await createStockItem({ skuId: trimmed, quantity: qty, costPrice: cost })
      onCreated(item)
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Novo item de estoque</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">SKU (UUID)</label>
            <input
              type="text"
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">Quantidade inicial</label>
              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Custo (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
