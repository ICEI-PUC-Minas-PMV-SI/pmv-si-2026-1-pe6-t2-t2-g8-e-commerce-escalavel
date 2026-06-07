import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';

import {
  Text,
  Button,
  Divider,
} from 'react-native-paper';

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
  transactionId?: string;
  items: OrderItem[];
};

type Props = {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
};

export default function OrderDetailsModal({
  visible,
  order,
  onClose,
}: Props) {
  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <Text style={styles.title}>
            Pedido #{order.id}
          </Text>

          <Text style={styles.status}>
            Status: {order.status}
          </Text>

          {order.transactionId && (
            <Text style={styles.status}>
              Transação: {order.transactionId}
            </Text>
          )}

          <Divider style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.itemsContainer}
          >
            {order.items.map(item => {
              const subtotal =
                item.quantity * item.unitPrice;

              return (
                <View
                  key={item.id}
                  style={styles.itemCard}
                >
                  <Text style={styles.productName}>
                    {item.productName}
                  </Text>

                  <Text style={styles.itemInfo}>
                    Tamanho: {item.size}
                  </Text>

                  <Text style={styles.itemInfo}>
                    Quantidade: {item.quantity}
                  </Text>

                  <Text style={styles.itemInfo}>
                    Preço unitário: R$ {item.unitPrice.toFixed(2)}
                  </Text>

                  <Text style={styles.subtotal}>
                    Subtotal: R$ {subtotal.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <Divider style={styles.divider} />

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>
              Total do pedido
            </Text>

            <Text style={styles.totalValue}>
              R$ {order.total.toFixed(2)}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={onClose}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Fechar
          </Button>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  status: {
    marginTop: 6,
    fontSize: 16,
    color: '#6B7280',
  },

  divider: {
    marginVertical: 16,
  },

  itemsContainer: {
    maxHeight: 350,
  },

  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  itemInfo: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },

  subtotal: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
  },

  totalContainer: {
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },

  button: {
    borderRadius: 12,
  },

  buttonContent: {
    height: 50,
  },
});