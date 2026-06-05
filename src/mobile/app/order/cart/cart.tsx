import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/src/components/CartItem';

export default function CartScreen() {
  const router = useRouter();

  const {
    items,
    removeItem,
    increaseQty,
    decreaseQty,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedItems(
      new Set(items.map(item => item.productId))
    );
  }, [items]);

  function toggleSelect(id: string) {
    setSelectedItems(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  const selectedTotal = items
    .filter(item => selectedItems.has(item.productId))
    .reduce(
      (sum, item) =>
        sum + item.unitPrice * item.quantity,
      0
    );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall">
          Seu carrinho está vazio
        </Text>

        <Button
          mode="contained"
          onPress={() => router.push('/')}
          style={{ marginTop: 20 }}
        >
          Voltar às compras
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.list}>
        {items.map(item => (
          <CartItem
            key={item.productId}
            item={item}
            selected={selectedItems.has(item.productId)}
            onToggleSelect={toggleSelect}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            onRemove={removeItem}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>

        <Text style={styles.totalLabel}>
          Total
        </Text>

        <Text style={styles.totalValue}>
          R$ {selectedTotal.toFixed(2)}
        </Text>

        <Button
          mode="contained"
          disabled={selectedTotal === 0}
          onPress={() => router.push('/order/checkout/checkout')}
            contentStyle={{ paddingVertical: 6, height: 48 }}
          labelStyle={{ fontSize: 16, fontWeight: '600', marginTop: 6 }}
          style={[styles.checkoutButton, { borderRadius: 12 }]}
        >
          Finalizar Compra
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
  container: {
    flex: 1,
  },

  list: {
    padding: 16,
    paddingBottom: 100,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 16,
  },

  checkoutButton: {
    marginBottom: 10,
  },

  continueButton: {
    marginBottom: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});