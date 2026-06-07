import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Banner } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { useCart } from '@/contexts/CartContext';
import { stockService } from '@/src/services/stockService';
import type { CartItem as CartItemType } from '@/contexts/CartContext';
import CartItem from '@/src/components/CartItem';

const PRICE_FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, increaseQty, decreaseQty } = useCart();

  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [stockMap, setStockMap]         = useState<Record<string, number>>({});
  const [checkingStock, setCheckingStock] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSelectedSkus(new Set(items.map(i => i.skuId)));

      if (items.length === 0) return;
      setCheckingStock(true);
      Promise.all(
        items.map(item =>
          stockService.getBySku(item.skuId)
            .then(s => [item.skuId, s?.quantityAvailable ?? 0] as [string, number])
            .catch(() => [item.skuId, 0] as [string, number])
        )
      ).then(entries => setStockMap(Object.fromEntries(entries)))
       .finally(() => setCheckingStock(false));
    }, [items.length])
  );

  function toggleSelect(skuId: string) {
    setSelectedSkus(prev => {
      const next = new Set(prev);
      next.has(skuId) ? next.delete(skuId) : next.add(skuId);
      return next;
    });
  }

  const isOutOfStock = (item: CartItemType) => {
    const available = stockMap[item.skuId];
    return available !== undefined && item.quantity > available;
  };

  const selectedItems = items.filter(i => selectedSkus.has(i.skuId));
  const outOfStockSelected = selectedItems.filter(isOutOfStock);
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const canCheckout = selectedTotal > 0 && outOfStockSelected.length === 0 && !checkingStock;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall">Seu carrinho está vazio</Text>
        <Button mode="contained" onPress={() => router.push('/')} style={{ marginTop: 20 }}>
          Voltar às compras
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {outOfStockSelected.length > 0 && (
          <Banner visible icon="alert-circle-outline" style={styles.banner}>
            {outOfStockSelected.length === 1
              ? `"${outOfStockSelected[0].productName}" está sem estoque suficiente.`
              : `${outOfStockSelected.length} itens selecionados estão sem estoque suficiente.`}
          </Banner>
        )}

        {items.map(item => (
          <CartItem
            key={item.skuId}
            item={item}
            selected={selectedSkus.has(item.skuId)}
            outOfStock={isOutOfStock(item)}
            onToggleSelect={toggleSelect}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            onRemove={removeItem}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{PRICE_FMT.format(selectedTotal)}</Text>

        <Button
          mode="contained"
          disabled={!canCheckout}
          loading={checkingStock}
          onPress={() => router.push('/order/checkout/checkout')}
          contentStyle={{ paddingVertical: 6, height: 48 }}
          labelStyle={{ fontSize: 16, fontWeight: '600', marginTop: 6 }}
          style={[styles.checkoutButton, { borderRadius: 12 }]}
        >
          {checkingStock ? 'Verificando estoque…' : 'Finalizar Compra'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/')}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          style={[styles.continueButton, { borderRadius: 12 }]}
        >
          Continuar Comprando
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  list:           { padding: 16, paddingBottom: 100, gap: 2 },
  banner:         { marginBottom: 8, borderRadius: 8 },
  footer:         { padding: 16, borderTopWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  totalLabel:     { fontSize: 14, color: '#6B7280' },
  totalValue:     { fontSize: 24, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  checkoutButton: { marginBottom: 10 },
  continueButton: { marginBottom: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
