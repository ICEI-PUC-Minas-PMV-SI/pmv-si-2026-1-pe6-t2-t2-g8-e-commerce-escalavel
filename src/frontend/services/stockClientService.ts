import { HttpClient, authHeader } from './httpClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'
const httpClient = new HttpClient(API_URL)

export interface StockItem {
  id: string
  skuId: string
  costPrice: number
  quantityAvailable: number
  quantityReserved: number
}

export type StockMovementType =
  | 'reserve'
  | 'release'
  | 'confirm'
  | 'restock'
  | 'adjustment'

export interface StockMovement {
  id: string
  skuId: string
  orderId: string | null
  type: StockMovementType
  quantity: number
  reason: string | null
  createdAt: string
}

export interface CreateStockPayload {
  skuId: string
  quantity: number
  costPrice: number
}

export interface RestockPayload {
  quantity: number
}

export interface AdjustPayload {
  delta: number
  reason: string
}

type ApiResponse<T> = {
  data?: T
}

function unwrap<T>(payload: T | ApiResponse<T>, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    const inner = (payload as ApiResponse<T>).data
    return inner ?? fallback
  }
  return (payload as T) ?? fallback
}

export async function getAllStockItems(signal?: AbortSignal): Promise<StockItem[]> {
  const payload = await httpClient.get<StockItem[] | ApiResponse<StockItem[]>>('/stock/', {
    signal,
    headers: authHeader(),
  })

  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function getStockBySkuId(skuId: string, signal?: AbortSignal): Promise<StockItem | null> {
  try {
    const payload = await httpClient.get<StockItem | ApiResponse<StockItem>>(`/stock/${skuId}`, {
      signal,
      headers: authHeader(),
    })
    return unwrap<StockItem>(payload, null as unknown as StockItem) || null
  } catch (err) {
    if (err instanceof Error && /404/.test(err.message)) return null
    throw err
  }
}

export async function createStockItem(payload: CreateStockPayload): Promise<StockItem> {
  const res = await httpClient.post<StockItem | ApiResponse<StockItem>>('/stock/', payload, {
    headers: authHeader(),
  })
  return unwrap<StockItem>(res, res as StockItem)
}

export async function restockItem(skuId: string, payload: RestockPayload): Promise<StockItem> {
  const res = await httpClient.put<StockItem | ApiResponse<StockItem>>(
    `/stock/${skuId}/restock`,
    payload,
    { headers: authHeader() }
  )
  return unwrap<StockItem>(res, res as StockItem)
}

export async function adjustItem(skuId: string, payload: AdjustPayload): Promise<StockItem> {
  const res = await httpClient.put<StockItem | ApiResponse<StockItem>>(
    `/stock/${skuId}/adjust`,
    payload,
    { headers: authHeader() }
  )
  return unwrap<StockItem>(res, res as StockItem)
}

export async function getStockHistory(skuId: string, signal?: AbortSignal): Promise<StockMovement[]> {
  const payload = await httpClient.get<StockMovement[] | ApiResponse<StockMovement[]>>(
    `/stock/${skuId}/history`,
    { signal, headers: authHeader() }
  )
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}
