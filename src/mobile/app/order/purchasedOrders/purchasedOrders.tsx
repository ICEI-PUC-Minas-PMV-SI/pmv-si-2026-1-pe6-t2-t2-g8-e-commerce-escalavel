import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import OrderCard from '@/src/components/OrderCard';
import CancelOrderModal from '@/src/components/modals/CancelOrderModal';
import DeliveredOrderModal from '@/src/components/modals/DeliveredOrderModal';
import OrderDetailsModal from '@/src/components/modals/OrderDetailsModal';

import { useAuth } from '@/src/contexts/AuthContext';
import { orderService, OrderStatus } from '@/src/services/orderService';

type OrderItem = {
  skuId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  transactionId?: string;
  items: OrderItem[];
};

export default function PurchasedOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);


  useEffect(() => {
    if (!user?.id) return;

    async function loadOrders() {
      try {
        const data = await orderService.getOrdersByUserId(user.id);
        const normalized = data.map(o => ({
          ...o,
          total: o.items.reduce(
            (sum, it) => sum + Number(it.unitPrice || 0) * it.quantity,
            0
          ),
        }));
        setOrders(normalized);
      } catch (err) {
        console.log('Erro ao carregar pedidos:', err);
        setOrders([]);
      }
    }

    loadOrders();
  }, [user]);

  const activeOrders = orders.filter(
    order => order.status !== OrderStatus.CANCELLED
  );

  const canceledOrders = orders.filter(
    order => order.status === OrderStatus.CANCELLED
  );

  function handleCancelOrder(order: Order) {
    setOrderToCancel(order.id);
    setShowCancelModal(true);
  }

  async function handleConfirmCancel() {
    if (!orderToCancel) return;

    const id = orderToCancel;
    setOrderToCancel(null);
    setShowCancelModal(false);

    try {
      await orderService.cancelOrder(id);
      setOrders(prev =>
        prev.map(order =>
          order.id === id
            ? { ...order, status: OrderStatus.CANCELLED }
            : order
        )
      );
    } catch (err) {
      console.log('Erro ao cancelar pedido:', err);
    }
  }

  function handleDiscardOrder(orderId: string) {
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Meus pedidos</Text>

        {/* PEDIDOS ATIVOS */}
        {activeOrders.map(order => (
          <OrderCard
            key={order.id}
            order={{
              id: order.id,
              status: order.status,
              productName:
                order.items.length === 1
                  ? `Pedido - item ${order.items[0].productId}`
                  : `Pedido - ${order.items.length} itens`,
              total: order.total,
            }}
            onViewDetails={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
            onCancel={() => handleCancelOrder(order)}
            onDiscard={() => handleDiscardOrder(order.id)}
          />
        ))}

        {/* PEDIDOS CANCELADOS */}
        {canceledOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pedidos cancelados
            </Text>

            <View style={styles.canceledContainer}>
              {canceledOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={{
                    id: order.id,
                    status: order.status,
                    productName:
                      order.items.length === 1
                        ? `Pedido - item ${order.items[0].productId}`
                        : `Pedido - ${order.items.length} itens`,
                    total: order.total,
                  }}
                  onViewDetails={() => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                  onCancel={() => {}}
                  onDiscard={() => handleDiscardOrder(order.id)}
                />
              ))}
            </View>
          </View>
        )}

        {orders.length === 0 && (
          <Text style={styles.empty}>
            Você ainda não possui pedidos.
          </Text>
        )}

      </ScrollView>

      {/* MODAIS */}
      <CancelOrderModal
        visible={showCancelModal}
        onCancel={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
      />

      <DeliveredOrderModal
        visible={showDeliveredModal}
        onClose={() => setShowDeliveredModal(false)}
      />

      <OrderDetailsModal
        visible={showDetailsModal}
        order={selectedOrder}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#6B7280',
  },

  canceledContainer: {
    opacity: 0.65,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
    fontSize: 16,
  },
});