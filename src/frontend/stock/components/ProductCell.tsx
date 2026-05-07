import { useProductInfo } from '../hooks/useProductInfo'

interface Props {
  skuId: string
}

export default function ProductCell({ skuId }: Props) {
  const { data, loading } = useProductInfo(skuId)

  const img = data?.product.urlImg
  const name = data?.product.name
  const size = data?.sku.size
  const code = data?.sku.code

  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-gray-100" />
        ) : img ? (
          <img
            src={img}
            alt={name ?? 'produto'}
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
        <div className="truncate text-sm font-medium text-gray-900" title={name ?? ''}>
          {loading ? '—' : (name ?? 'Produto não encontrado')}
        </div>
        {(size || code) && (
          <div className="truncate text-xs text-gray-500">
            {[code, size].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  )
}
