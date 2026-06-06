import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import OrderCard from '@/src/components/OrderCard';

import CancelOrderModal from '@/src/components/modals/CancelOrderModal';
import DeliveredOrderModal from '@/src/components/modals/DeliveredOrderModal';
import OrderDetailsModal from '@/src/components/modals/OrderDetailsModal';

type OrderItem = {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
};

export default function PurchasedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [showDeliveredModal, setShowDeliveredModal] =
    useState(false);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [orderToCancel, setOrderToCancel] =
    useState<string | null>(null);

  useEffect(() => {
    setOrders([
      {
        id: '1023',
        status: 'Entregue',
        total: 329.7,
        items: [
          {
            id: '1',
            productName: 'Camiseta Básica Insider',
            size: 'M',
            quantity: 2,
            unitPrice: 89.9,
          },
          {
            id: '2',
            productName: 'Calça Slim Masculina',
            size: 'G',
            quantity: 1,
            unitPrice: 149.9,
          },
        ],
      },

      {
        id: '1022',
        status: 'Cancelado',
        total: 89.9,
        items: [
          {
            id: '3',
            productName: 'Camiseta Oversized',
            size: 'P',
            quantity: 1,
            unitPrice: 89.9,
          },
        ],
      },

      {
        id: '1021',
        status: 'Em processamento',
        total: 399.9,
        items: [
          {
            id: '4',
            productName: 'Jaqueta Casual',
            size: 'G',
            quantity: 1,
            unitPrice: 229.9,
          },
          {
            id: '5',
            productName: 'Calça Cargo',
            size: 'M',
            quantity: 1,
            unitPrice: 170,
          },
        ],
      },

      {
        id: '1020',
        status: 'Enviado',
        total: 149.9,
        items: [
          {
            id: '6',
            productName: 'Calça Slim',
            size: 'M',
            quantity: 1,
            unitPrice: 149.9,
          },
        ],
      },
    ]);
  }, []);

  const activeOrders = orders.filter(
    order => order.status !== 'Cancelado'
  );

  const canceledOrders = orders.filter(
    order => order.status === 'Cancelado'
  );

  function handleCancelOrder(order: Order) {
    if (order.status === 'Entregue') {
      setShowDeliveredModal(true);
      return;
    }

    setOrderToCancel(order.id);
    setShowCancelModal(true);
  }

  function handleConfirmCancel() {
    if (!orderToCancel) return;

    setOrders(prev =>
      prev.map(order =>
        order.id === orderToCancel
          ? { ...order, status: 'Cancelado' }
          : order
      )
    );

    setOrderToCancel(null);
    setShowCancelModal(false);
  }

  function handleDiscardOrder(orderId: string) {
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>
          Meus pedidos
        </Text>

        {/* PEDIDOS ATIVOS */}
        {activeOrders.map(order => (
          <OrderCard
            key={order.id}
            order={{
              id: order.id,
              status: order.status,
              productName:
                order.items.length === 1
                  ? order.items[0].productName
                  : `Pedido - ${order.items.length} itens`,
              total: order.total,
            }}
            onViewDetails={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
            onCancel={() =>
              handleCancelOrder(order)
            }
            onDiscard={() =>
              handleDiscardOrder(order.id)
            }
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
                        ? order.items[0].productName
                        : `Pedido - ${order.items.length} itens`,
                    total: order.total,
                  }}
                  onViewDetails={() => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                  onCancel={() => {}}
                  onDiscard={() =>
                    handleDiscardOrder(order.id)
                  }
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
        onClose={() =>
          setShowDeliveredModal(false)
        }
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