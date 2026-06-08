import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cartStorage } from './cartStorage';

const CART_STORAGE_KEY = 'cart';

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
  removeItem: (skuId: string) => void;
  increaseQty: (skuId: string) => void;
  decreaseQty: (skuId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [items, setItems] = useState<CartItem[]>([]);
  // Evita gravar o estado inicial vazio por cima do carrinho salvo antes da carga.
  const hydrated = useRef(false);

  // Carregar carrinho salvo na montagem (kv-store é assíncrono, backed por SQLite).
  useEffect(() => {
    (async () => {
      try {
        const raw = await cartStorage.getItem(CART_STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        // storage indisponível / JSON corrompido — começa com carrinho vazio.
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Persistir carrinho a cada mudança, após a hidratação inicial.
  useEffect(() => {
    if (!hydrated.current) return;
    cartStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {
      // falha de escrita — ignora, mantém estado em memória.
    });
  }, [items]);

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

  function increaseQty(skuId: string) {
    setItems(prev =>
      prev.map(i =>
        i.skuId === skuId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  }

  function decreaseQty(skuId: string) {
    setItems(prev =>
      prev
        .map(i =>
          i.skuId === skuId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  }

  function removeItem(skuId: string) {
    setItems(prev => prev.filter(i => i.skuId !== skuId));
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