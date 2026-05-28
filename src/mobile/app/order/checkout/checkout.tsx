import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useCart } from '../../../contexts/CartContext';
import { orderService } from '../../../src/services/orderService';
import OrderSuccessModal from '../../../src/components/modals/OrderSuccessModal';



export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const [modalVisible, setModalVisible] = useState(false);

  async function handleCheckout() {
    try {
      if (items.length === 0) return;

      const payload = {
        userId: 'USER_ID_FIXO',
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      };

      await orderService.createOrder(payload);

      clearCart();
      setModalVisible(true);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Checkout
        </Text>

        <Text style={{ marginTop: 10 }}>
          Total: R$ {total.toFixed(2)}
        </Text>
      </View>

      <Pressable
        onPress={handleCheckout}
        style={{ backgroundColor: 'green', padding: 14 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Finalizar compra
        </Text>
      </Pressable>

      <OrderSuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGoToOrders={() => {
          setModalVisible(false);
          // depois você navega para orders
          // router.push('/order/orders')
        }}
      />
    </View>
  );
}