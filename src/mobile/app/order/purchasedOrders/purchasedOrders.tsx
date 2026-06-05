import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import OrderCard from '@/src/components/OrderCard';

type Order = {
  id: string;
  status: string;
  productName: string;
  total: number;
  productId?: string;
};

export default function PurchasedOrders() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders([
      {
        id: '1',
        status: 'Entregue',
        productName: 'Pedido #1023 - 2 itens',
        total: 259.9,
        productId: '123',
      },
      {
        id: '2',
        status: 'Cancelado',
        productName: 'Pedido #1022 - 1 item',
        total: 89.9,
      },
      {
        id: '3',
        status: 'Em processamento',
        productName: 'Pedido #1021 - 3 itens',
        total: 399.9,
      },
    ]);
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Cancelado');
  const canceledOrders = orders.filter(o => o.status === 'Cancelado');

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Meus pedidos</Text>

      {/* ATIVOS */}
      {activeOrders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onViewDetails={() =>
            router.push(`/product/${order.productId}` as any)
          }
          onCancel={() =>
            setOrders(prev =>
              prev.map(o =>
                o.id === order.id
                  ? { ...o, status: 'Cancelado' }
                  : o
              )
            )
          }
          onDiscard={() =>
            setOrders(prev => prev.filter(o => o.id !== order.id))
          }
        />
      ))}

      {/* CANCELADOS */}
      {canceledOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Cancelados
          </Text>

          <View style={{ opacity: 0.6 }}>
            {canceledOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() =>
                  router.push(`/product/${order.productId}` as any)
                }
                onCancel={() => {}}
                onDiscard={() =>
                  setOrders(prev =>
                    prev.filter(o => o.id !== order.id)
                  )
                }
              />
            ))}
          </View>
        </View>
      )}

      {/* EMPTY */}
      {orders.length === 0 && (
        <Text style={styles.empty}>
          Você ainda não possui pedidos.
        </Text>
      )}

    </ScrollView>
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
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#6B7280',
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#9CA3AF',
  },
});