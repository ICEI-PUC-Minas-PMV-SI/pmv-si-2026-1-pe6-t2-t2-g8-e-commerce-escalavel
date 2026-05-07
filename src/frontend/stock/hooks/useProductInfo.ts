import { useEffect, useState } from 'react'
import { getProductBySkuId, type SkuWithProduct } from '../../services/catalogClientService'

interface State {
  data: SkuWithProduct | null
  loading: boolean
  error: string | null
}

export function useProductInfo(skuId: string): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false

    getProductBySkuId(skuId)
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Falha ao carregar produto.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [skuId])

  return state
}
