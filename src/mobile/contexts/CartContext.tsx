import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CartItem {
  skuId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextData {
  items: CartItem[];
  total: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  increaseQty: (productId: string, size: string, color: string) => void;
  decreaseQty: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: CartItem) {
    setItems(prev => {
      const existing = prev.find(i => i.skuId === item.skuId);

      if (existing) {
        return prev.map(i =>
          i.skuId === item.skuId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  }

  function removeItem(productId: string, size?: string, color?: string) {
    setItems(prev =>
      prev.filter(
        i =>
          !(
            i.productId === productId &&
            i.size === size &&
            i.color === color
          )
      )
    );
  }

  function increaseQty(productId: string, size: string, color: string) {
    setItems(prev =>
      prev.map(i =>
        i.productId === productId &&
          i.size === size &&
          i.color === color
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  }

  function decreaseQty(productId: string, size: string, color: string) {
    setItems(prev =>
      prev
        .map(i =>
          i.productId === productId &&
            i.size === size &&
            i.color === color
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addItem,
        removeItem,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}