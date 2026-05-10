import { createContext, useContext, useState, useCallback } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  variant?: string
  sku?: string
  skuId?: string
  price: number
  quantity: number
}

export interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      // Verificar se já existe item igual (mesmo produto, variante e sku)
      const existingIndex = prev.findIndex(
        i => 
          i.productId === item.productId &&
          i.variant === item.variant &&
          i.sku === item.sku
      )

      if (existingIndex >= 0) {
        // Se existe, aumentar quantidade
        const updated = [...prev]
        updated[existingIndex].quantity += item.quantity
        return updated
      }

      // Se não existe, adicionar novo
      return [
        ...prev,
        {
          ...item,
          id: `${item.productId}-${item.variant}-${item.sku}-${item.skuId}-${Date.now()}`
        }
      ]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }
  return context
}