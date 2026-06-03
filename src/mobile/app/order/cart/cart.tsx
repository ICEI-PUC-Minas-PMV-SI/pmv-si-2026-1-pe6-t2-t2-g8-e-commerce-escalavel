import { View, Text, FlatList, Pressable } from 'react-native';
import { useCart } from '../../../contexts/CartContext';

export default function CartPage() {
  const {
    items,
    total,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Carrinho
      </Text>

      {items.length === 0 ? (
        <Text>Seu carrinho está vazio</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Text>{item.productName}</Text>
                <Text>R$ {item.unitPrice}</Text>
                <Text>Qtd: {item.quantity}</Text>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <Pressable onPress={() => decreaseQty(item.productId)}>
                    <Text>-</Text>
                  </Pressable>

                  <Pressable onPress={() => increaseQty(item.productId)}>
                    <Text>+</Text>
                  </Pressable>

                  <Pressable onPress={() => removeItem(item.productId)}>
                    <Text>Remover</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />

          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Total: R$ {total.toFixed(2)}
          </Text>

          <Pressable
            onPress={clearCart}
            style={{
              marginTop: 10,
              padding: 10,
              backgroundColor: 'red',
            }}
          >
            <Text style={{ color: 'white' }}>Limpar carrinho</Text>
          </Pressable>

          <Pressable
            style={{
              marginTop: 10,
              padding: 10,
              backgroundColor: 'green',
            }}
          >
            <Text style={{ color: 'white' }}>Ir para checkout</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}