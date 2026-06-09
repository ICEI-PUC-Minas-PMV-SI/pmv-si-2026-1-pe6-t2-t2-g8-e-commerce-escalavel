// Resolve `urlImg` armazenado no DB (apenas filename/key) para URL absoluta.
// Dev default: gateway proxy → MinIO bucket `products`.
// Prod: setar VITE_IMAGE_BASE_URL=https://cdn.<host>/images/products no build.

const ABSOLUTE_URL_RE = /^(https?:|data:|file:)/i

const DEFAULT_BASE = 'http://localhost:7000/images/products'

export const IMAGE_BASE_URL = (
  import.meta.env.VITE_IMAGE_BASE_URL || DEFAULT_BASE
).replace(/\/+$/, '')

export function resolveImageUri(raw) {
  if (!raw) return null
  const trimmed = String(raw).trim()
  if (!trimmed) return null
  if (ABSOLUTE_URL_RE.test(trimmed)) return trimmed
  if (!IMAGE_BASE_URL) return null
  // Normaliza key: tira barras iniciais e um prefixo `assets/` legado
  // (variants do catálogo gravam `/assets/<file>`, mas o objeto fica na
  // raiz do bucket `products`). Mantém o filename igual ao do produto.
  const key = trimmed.replace(/^\/+/, '').replace(/^assets\//i, '')
  return `${IMAGE_BASE_URL}/${encodeURI(key)}`
}
