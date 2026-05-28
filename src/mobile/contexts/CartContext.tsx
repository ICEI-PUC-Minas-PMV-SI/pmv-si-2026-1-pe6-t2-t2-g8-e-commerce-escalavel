import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextData {
  items: CartItem[];
  total: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: CartItem) {
    setItems((prev) => {
      const existing = prev.find(i => i.productId === item.productId);

      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }

  function increaseQty(productId: string) {
    setItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  }

  function decreaseQty(productId: string) {
    setItems(prev =>
      prev
        .map(i =>
          i.productId === productId
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