import { HttpClient } from './httpClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'
const httpClient = new HttpClient(API_URL)

export interface StockItem {
  id: string
  skuId: string
  costPrice: number
  quantityAvailable: number
  quantityReserved: number
}

type ApiResponse<T> = {
  data?: T
}

export async function getAllStockItems(signal?: AbortSignal): Promise<StockItem[]> {
  const payload = await httpClient.get<StockItem[] | ApiResponse<StockItem[]>>('/stock/', { signal })

  if (Array.isArray(payload)) {
    return payload
  }

  return Array.isArray(payload?.data) ? payload.data : []
}
