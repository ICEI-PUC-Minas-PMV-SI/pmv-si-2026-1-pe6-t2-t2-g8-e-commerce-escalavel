import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';

type Props = {
  order: {
    id: string;
    status: string;
    productName: string;
    total: number;
  };

  onViewDetails: () => void;
  onCancel: () => void;
  onDiscard: () => void;
};

export default function OrderCard({
  order,
  onViewDetails,
  onCancel,
  onDiscard,
}: Props) {
  const isCanceled = order.status.toLowerCase() === 'cancelado';

  return (
    <Card style={styles.card}>
      <Card.Content>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {order.productName}
          </Text>

          <Text
            style={[
              styles.status,
              isCanceled && { color: 'red' },
            ]}
          >
            {order.status}
          </Text>
        </View>

        {/* TOTAL */}
        <Text style={styles.total}>
          Total: R$ {order.total.toFixed(2)}
        </Text>

        {/* ACTIONS */}
        <View style={styles.actions}>

          <Button
            mode="text"
            onPress={onViewDetails}
          >
            Ver detalhes
          </Button>

          {!isCanceled && (
            <Button
              mode="text"
              textColor="red"
              onPress={onCancel}
            >
              Cancelar
            </Button>
          )}

          {isCanceled && (
            <IconButton
              icon="trash-can-outline"
              iconColor="red"
              onPress={onDiscard}
            />
          )}

        </View>

      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  status: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  total: {
    marginTop: 6,
    fontSize: 14,
    color: '#111827',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
});