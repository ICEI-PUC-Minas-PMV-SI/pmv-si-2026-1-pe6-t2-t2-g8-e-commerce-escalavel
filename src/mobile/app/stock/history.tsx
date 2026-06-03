import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Banner, Card, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';
import type { StockMovement, StockMovementType } from '@/src/types/stock';

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const TYPE_LABEL: Record<StockMovementType, string> = {
  reserve: 'Reserva',
  release: 'Liberação',
  confirm: 'Confirmação',
  restock: 'Reabastecimento',
  adjustment: 'Ajuste',
};

const TYPE_COLOR: Record<StockMovementType, string> = {
  reserve: '#1e40af',
  release: '#374151',
  confirm: '#047857',
  restock: '#6d28d9',
  adjustment: '#b45309',
};

export default function HistoryScreen() {
  const { skuId, name } = useLocalSearchParams<{ skuId: string; name?: string }>();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    stockService
      .history(skuId, controller.signal)
      .then(setMovements)
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message || 'Falha ao carregar histórico.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [skuId]);

  const renderItem = ({ item }: { item: StockMovement }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardBody}>
        <View style={styles.headRow}>
          <Chip
            compact
            textStyle={styles.chipText}
            style={[styles.chip, { backgroundColor: TYPE_COLOR[item.type] }]}
          >
            {TYPE_LABEL[item.type]}
          </Chip>
          <Text variant="bodySmall" style={styles.muted}>
            {DATE_FORMATTER.format(new Date(item.createdAt))}
          </Text>
        </View>
        <Text variant="bodyMedium">
          Quantidade:{' '}
          <Text style={styles.bold}>
            {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
          </Text>
        </Text>
        {item.orderId ? (
          <Text variant="bodySmall" style={styles.mono} numberOfLines={1}>
            Pedido: {item.orderId}
          </Text>
        ) : null}
        {item.reason ? (
          <Text variant="bodySmall" style={styles.muted}>
            Motivo: {item.reason}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        {name ? <Text variant="titleMedium">{name}</Text> : null}
        <Text variant="bodySmall" style={styles.mono} numberOfLines={1}>
          {skuId}
        </Text>
      </View>

      <Banner visible={!!error} icon="alert-circle-outline">
        {error ?? ''}
      </Banner>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={movements}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !error ? (
              <Text variant="bodyMedium" style={styles.empty}>
                Nenhum movimento registrado.
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  card: { borderRadius: 8 },
  cardBody: { gap: spacing.xxs },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: { borderRadius: 4 },
  chipText: { color: '#ffffff', fontSize: 12 },
  muted: { opacity: 0.6 },
  bold: { fontWeight: '700' },
  mono: { fontFamily: 'monospace', opacity: 0.7 },
  loading: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: spacing.huge, opacity: 0.6 },
});
