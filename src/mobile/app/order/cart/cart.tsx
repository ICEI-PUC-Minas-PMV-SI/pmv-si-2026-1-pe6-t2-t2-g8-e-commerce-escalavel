import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const router = useRouter();

  const {
    items,
    total,
    removeItem,
    increaseQty,
    decreaseQty,
  } = useCart();

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
          <Card key={item.productId} style={styles.card}>
            <Card.Content>

              <Text variant="titleMedium">
                {item.productName}
              </Text>

              <Text variant="bodyMedium">
                R$ {item.unitPrice.toFixed(2)}
              </Text>

              <View style={styles.qtyRow}>
                <IconButton
                  icon="minus"
                  onPress={() => decreaseQty(item.productId)}
                />

                <Text variant="titleMedium">
                  {item.quantity}
                </Text>

                <IconButton
                  icon="plus"
                  onPress={() => increaseQty(item.productId)}
                />
              </View>

              <Text variant="bodyLarge">
                Subtotal: R$ {(item.quantity * item.unitPrice).toFixed(2)}
              </Text>

              <Button
                mode="text"
                textColor="red"
                onPress={() => removeItem(item.productId)}
              >
                Remover
              </Button>

            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text variant="titleLarge">
          Total: R$ {total.toFixed(2)}
        </Text>

        <Button
          mode="contained"
          onPress={() => router.push('/order/checkout/checkout')}
          style={{ marginTop: 12 }}
        >
          Finalizar Compra
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/')}
          style={{ marginTop: 8 }}
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
    gap: 12,
  },

  card: {
    marginBottom: 12,
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});