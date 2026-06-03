import { useEffect, useState } from 'react'
import { getStockHistory, type StockItem, type StockMovement } from '../../services/stockClientService'

interface Props {
  item: StockItem | null
  onClose: () => void
}

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const TYPE_LABEL: Record<StockMovement['type'], string> = {
  reserve: 'Reserva',
  release: 'Liberação',
  confirm: 'Confirmação',
  restock: 'Reabastecimento',
  adjustment: 'Ajuste',
}

const TYPE_COLOR: Record<StockMovement['type'], string> = {
  reserve: 'bg-blue-100 text-blue-800',
  release: 'bg-gray-100 text-gray-800',
  confirm: 'bg-emerald-100 text-emerald-800',
  restock: 'bg-violet-100 text-violet-800',
  adjustment: 'bg-amber-100 text-amber-800',
}

export default function HistoryDrawer({ item, onClose }: Props) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!item) return
    const controller = new AbortController()

    getStockHistory(item.skuId, controller.signal)
      .then(setMovements)
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Falha ao carregar histórico.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [item])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-label="Fechar"
        role="button"
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Histórico de movimentos</h2>
            <p className="mt-0.5 truncate font-mono text-xs text-gray-500" title={item.skuId}>
              {item.skuId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-gray-600">Carregando...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && movements.length === 0 && (
            <p className="text-sm text-gray-600">Nenhum movimento registrado.</p>
          )}
          {!loading && !error && movements.length > 0 && (
            <ul className="space-y-3">
              {movements.map((m) => (
                <li key={m.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[m.type]}`}>
                      {TYPE_LABEL[m.type]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {DATE_FORMATTER.format(new Date(m.createdAt))}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-900">
                    Quantidade: <strong>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</strong>
                  </div>
                  {m.orderId && (
                    <div className="mt-1 truncate font-mono text-xs text-gray-500" title={m.orderId}>
                      Pedido: {m.orderId}
                    </div>
                  )}
                  {m.reason && (
                    <div className="mt-1 text-xs text-gray-700">
                      Motivo: {m.reason}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
