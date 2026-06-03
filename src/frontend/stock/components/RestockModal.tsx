import { FormEvent, useState } from 'react'
import { restockItem, type StockItem } from '../../services/stockClientService'

interface Props {
  item: StockItem | null
  onClose: () => void
  onUpdated: (item: StockItem) => void
}

export default function RestockModal({ item, onClose, onUpdated }: Props) {
  const [quantity, setQuantity] = useState('1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!item) return null

  const handleClose = () => {
    if (submitting) return
    setQuantity('1')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Quantidade deve ser inteiro > 0.')
      return
    }

    setSubmitting(true)
    try {
      const updated = await restockItem(item.skuId, { quantity: qty })
      onUpdated(updated)
      setQuantity('1')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reabastecer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Reabastecer estoque</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={item.skuId}
              readOnly
              className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600"
            />
          </div>
          <div className="text-xs text-gray-600">
            Disponível atual: <strong>{item.quantityAvailable}</strong>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Quantidade a adicionar</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              autoFocus
            />
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
              {submitting ? 'Enviando...' : 'Reabastecer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
