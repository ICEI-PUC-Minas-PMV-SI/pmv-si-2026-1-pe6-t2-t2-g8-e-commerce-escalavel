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

// label + cores por status (chave normalizada em UPPERCASE p/ casar com backend).
const STATUS_META: Record<string, { label: string; fg: string; bg: string }> = {
  CREATED:        { label: 'Criado',    fg: '#1D4ED8', bg: '#DBEAFE' },
  PAID:           { label: 'Pago',      fg: '#047857', bg: '#D1FAE5' },
  CANCELLED:      { label: 'Cancelado', fg: '#B91C1C', bg: '#FEE2E2' },
  PAYMENT_FAILED: { label: 'Falhou',    fg: '#B45309', bg: '#FEF3C7' },
};

function statusMeta(status: string) {
  return (
    STATUS_META[status?.toUpperCase()] ?? {
      label: status,
      fg: '#374151',
      bg: '#E5E7EB',
    }
  );
}

export default function OrderCard({
  order,
  onViewDetails,
  onCancel,
  onDiscard,
}: Props) {
  const isCanceled = order.status?.toUpperCase() === 'CANCELLED';
  const meta = statusMeta(order.status);

  return (
    <Card style={styles.card}>
      <Card.Content>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {order.productName}
          </Text>

          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeTxt, { color: meta.fg }]}>
              {meta.label}
            </Text>
          </View>
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

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },

  badgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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