import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAllStockItemsDetailed,
  type StockItem,
  type StockItemDetailed,
} from '../../services/stockClientService'
import Toast, { type ToastData } from '../../components/Toast'
import CreateStockModal from '../components/CreateStockModal'
import RestockModal from '../components/RestockModal'
import AdjustModal from '../components/AdjustModal'
import HistoryDrawer from '../components/HistoryDrawer'

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function StockListPage() {
  const [items, setItems] = useState<StockItemDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [restockTarget, setRestockTarget] = useState<StockItem | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<StockItem | null>(null)
  const [historyTarget, setHistoryTarget] = useState<StockItem | null>(null)

  const showToast = (message: string, type: ToastData['type']) =>
    setToast({ message, type })

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getAllStockItemsDetailed(signal)
      setItems(data)
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Falha ao carregar estoque.')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    refresh(controller.signal).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [refresh])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => {
      if (i.skuId.toLowerCase().includes(q)) return true
      const name = i.product?.name?.toLowerCase() ?? ''
      const code = i.product?.code?.toLowerCase() ?? ''
      return name.includes(q) || code.includes(q)
    })
  }, [items, search])

  const mergeUpdated = (updated: StockItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === updated.id)
      if (idx === -1) return prev
      const copy = [...prev]
      copy[idx] = { ...updated, product: prev[idx].product }
      return copy
    })
  }

  const handleCopy = async (skuId: string) => {
    try {
      await navigator.clipboard.writeText(skuId)
      showToast('SKU copiado.', 'success')
    } catch {
      showToast('Não foi possível copiar.', 'error')
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gestão de Estoque</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Adicionar itens, reabastecer ou ajustar quantidades.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por SKU, nome ou código..."
              className="w-72 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
            />
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Novo item
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
          {loading && (
            <p className="px-4 py-6 text-sm text-gray-600">Carregando estoque...</p>
          )}
          {!loading && error && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-600">
              {items.length === 0 ? 'Nenhum item de estoque cadastrado.' : 'Nenhum item bate com a busca.'}
            </p>
          )}
          {!loading && !error && filtered.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Produto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">SKU</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Disponível</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Reservado</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Custo</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const p = item.product
                  const subtitle = [p?.code, p?.size].filter(Boolean).join(' · ')
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {p?.urlImg ? (
                              <img
                                src={p.urlImg}
                                alt={p.name ?? 'produto'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                sem imagem
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900" title={p?.name ?? ''}>
                              {p?.name ?? 'Produto não encontrado'}
                            </div>
                            {subtitle && (
                              <div className="truncate text-xs text-gray-500">{subtitle}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleCopy(item.skuId)}
                          className="max-w-[28ch] truncate font-mono text-xs text-gray-700 hover:text-gray-900"
                          title={`${item.skuId} (clique para copiar)`}
                        >
                          {item.skuId}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-gray-900">
                        {item.quantityAvailable}
                      </td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-gray-600">
                        {item.quantityReserved}
                      </td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-gray-900">
                        {PRICE_FORMATTER.format(item.costPrice)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setRestockTarget(item)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Reabastecer
                          </button>
                          <button
                            onClick={() => setAdjustTarget(item)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Ajustar
                          </button>
                          <button
                            onClick={() => setHistoryTarget(item)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Histórico
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateStockModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          showToast('Item criado.', 'success')
          refresh()
        }}
      />
      <RestockModal
        item={restockTarget}
        onClose={() => setRestockTarget(null)}
        onUpdated={(item) => {
          mergeUpdated(item)
          showToast('Estoque reabastecido.', 'success')
        }}
      />
      <AdjustModal
        item={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onUpdated={(item) => {
          mergeUpdated(item)
          showToast('Estoque ajustado.', 'success')
        }}
      />
      <HistoryDrawer
        key={historyTarget?.skuId ?? 'closed'}
        item={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
