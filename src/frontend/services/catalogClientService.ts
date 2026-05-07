import { HttpClient, authHeader } from './httpClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'
const httpClient = new HttpClient(API_URL)

export interface Sku {
  id: string
  variantId: string
  productId: string
  size: string | null
  code: string | null
  price: number | null
}

export interface ProductSummary {
  id: string
  name: string
  description: string | null
  urlImg: string | null
  active: boolean | null
}

export interface SkuWithProduct {
  sku: Sku
  product: ProductSummary
}

const skuCache = new Map<string, Promise<Sku | null>>()
const productCache = new Map<string, Promise<ProductSummary | null>>()
const comboCache = new Map<string, Promise<SkuWithProduct | null>>()

function isNotFound(err: unknown): boolean {
  return err instanceof Error && /404/.test(err.message)
}

export function getSkuById(skuId: string): Promise<Sku | null> {
  const cached = skuCache.get(skuId)
  if (cached) return cached

  const promise = httpClient
    .get<Sku>(`/skus/${skuId}`, { headers: authHeader() })
    .catch((err) => {
      if (isNotFound(err)) return null
      skuCache.delete(skuId)
      throw err
    })

  skuCache.set(skuId, promise)
  return promise
}

export function getProductById(productId: string): Promise<ProductSummary | null> {
  const cached = productCache.get(productId)
  if (cached) return cached

  const promise = httpClient
    .get<ProductSummary>(`/products/${productId}`, { headers: authHeader() })
    .catch((err) => {
      if (isNotFound(err)) return null
      productCache.delete(productId)
      throw err
    })

  productCache.set(productId, promise)
  return promise
}

export function getProductBySkuId(skuId: string): Promise<SkuWithProduct | null> {
  const cached = comboCache.get(skuId)
  if (cached) return cached

  const promise = (async () => {
    const sku = await getSkuById(skuId)
    if (!sku) return null
    const product = await getProductById(sku.productId)
    if (!product) return null
    return { sku, product }
  })().catch((err) => {
    comboCache.delete(skuId)
    throw err
  })

  comboCache.set(skuId, promise)
  return promise
}
