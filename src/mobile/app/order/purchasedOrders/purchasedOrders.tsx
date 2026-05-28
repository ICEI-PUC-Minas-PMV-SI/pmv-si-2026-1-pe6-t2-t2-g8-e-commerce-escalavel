import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';

import { orderService } from '../../../src/services/orderService';
import CancelOrderModal from '../../../src/components/modals/CancelOrderModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function load() {
    const data = await orderService.getOrdersByUserId('USER_ID_FIXO');

    // remove cancelados da lista
    setOrders(data.filter((o) => o.status !== 'cancelled'));
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmCancel() {
    if (!selectedOrder) return;

    await orderService.cancelOrder(selectedOrder);

    setModalVisible(false);
    setSelectedOrder(null);

    await load();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Meus pedidos
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const canCancel =
            item.status === 'pending' || item.status === 'confirmed';

          return (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                marginTop: 10,
              }}
            >
              <Text>ID: {item.id}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Total: R$ {item.totalAmount}</Text>

              {canCancel && (
                <Pressable
                  onPress={() => {
                    setSelectedOrder(item.id);
                    setModalVisible(true);
                  }}
                  style={{ marginTop: 10, backgroundColor: 'red', padding: 8 }}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>
                    🗑 Cancelar pedido
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />

      <CancelOrderModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmCancel}
      />
    </View>
  );
}