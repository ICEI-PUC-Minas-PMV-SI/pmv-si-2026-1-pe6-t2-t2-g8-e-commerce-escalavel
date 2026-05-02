import { useEffect, useState } from 'react'
import { getAllStockItems, type StockItem } from '../../services/stockClientService'

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function StockListPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchStock() {
      setLoading(true)
      setError(null)

      try {
        const data = await getAllStockItems(controller.signal)
        setItems(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setError('Failed to load stock. Check your gateway/API connection.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchStock()

    return () => {
      controller.abort()
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p className="text-sm text-gray-600">Loading stock...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p className="text-sm text-gray-600">No stock items found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-md border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900">SKU</h3>
              <p className="mt-1 truncate text-xs text-gray-500" title={item.skuId}>{item.skuId}</p>
              <p className="mt-2 text-xs text-gray-500">
                Available: {item.quantityAvailable} | Reserved: {item.quantityReserved}
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Cost: {PRICE_FORMATTER.format(item.costPrice)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
