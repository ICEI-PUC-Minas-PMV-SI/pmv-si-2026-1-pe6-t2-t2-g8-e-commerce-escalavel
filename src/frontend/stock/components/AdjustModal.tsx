import { FormEvent, useState } from 'react'
import { adjustItem, type StockItem } from '../../services/stockClientService'

interface Props {
  item: StockItem | null
  onClose: () => void
  onUpdated: (item: StockItem) => void
}

export default function AdjustModal({ item, onClose, onUpdated }: Props) {
  const [delta, setDelta] = useState('0')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!item) return null

  const numericDelta = Number(delta)
  const validDelta = Number.isInteger(numericDelta) && numericDelta !== 0
  const insufficient =
    validDelta && numericDelta < 0 && Math.abs(numericDelta) > item.quantityAvailable

  const handleClose = () => {
    if (submitting) return
    setDelta('0')
    setReason('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validDelta) {
      setError('Delta deve ser inteiro diferente de zero.')
      return
    }
    const trimmedReason = reason.trim()
    if (trimmedReason.length < 3) {
      setError('Motivo deve ter pelo menos 3 caracteres.')
      return
    }
    if (insufficient) {
      setError(`Estoque insuficiente. Disponível: ${item.quantityAvailable}.`)
      return
    }

    setSubmitting(true)
    try {
      const updated = await adjustItem(item.skuId, { delta: numericDelta, reason: trimmedReason })
      onUpdated(updated)
      setDelta('0')
      setReason('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao ajustar estoque.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Ajustar estoque</h2>
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
            <label className="block text-xs font-medium text-gray-700">
              Delta (use sinal negativo para remover)
            </label>
            <input
              type="number"
              step="1"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={255}
              placeholder="Ex.: avaria, perda, contagem física"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          {insufficient && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Aviso: ajuste excede disponível ({item.quantityAvailable}).
            </div>
          )}
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
              {submitting ? 'Enviando...' : 'Ajustar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
