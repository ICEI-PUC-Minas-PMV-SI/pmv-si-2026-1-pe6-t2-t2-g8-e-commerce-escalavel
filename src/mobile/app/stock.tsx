import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Banner,
  Button,
  Card,
  Divider,
  FAB,
  Searchbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';
import type { StockItemDetailed } from '@/src/types/stock';

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function StockListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<StockItemDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const data = await stockService.listDetailed(signal);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Falha ao carregar estoque.');
    }
  }, []);

  // Reload whenever the screen regains focus (e.g. returning from an op screen).
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      setLoading(true);
      load(controller.signal).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
      return () => controller.abort();
    }, [load])
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      if (i.skuId.toLowerCase().includes(q)) return true;
      const name = i.product?.name?.toLowerCase() ?? '';
      const code = i.product?.code?.toLowerCase() ?? '';
      return name.includes(q) || code.includes(q);
    });
  }, [items, search]);

  const renderItem = useCallback(
    ({ item }: { item: StockItemDetailed }) => {
      const p = item.product;
      const subtitle = [p?.code, p?.size].filter(Boolean).join(' · ');
      const params = {
        skuId: item.skuId,
        name: p?.name ?? '',
        available: String(item.quantityAvailable),
      };
      return (
        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.cardBody}>
            <Text variant="titleMedium" numberOfLines={1}>
              {p?.name ?? 'Produto não encontrado'}
            </Text>
            {subtitle ? (
              <Text variant="bodySmall" style={styles.muted}>
                {subtitle}
              </Text>
            ) : null}
            <Text variant="bodySmall" style={styles.sku} numberOfLines={1}>
              {item.skuId}
            </Text>

            <View style={styles.metrics}>
              <Metric label="Disponível" value={String(item.quantityAvailable)} />
              <Metric label="Reservado" value={String(item.quantityReserved)} />
              <Metric label="Custo" value={PRICE_FORMATTER.format(item.costPrice)} />
            </View>
          </Card.Content>
          <Divider />
          <Card.Actions>
            <Button
              compact
              onPress={() => router.push({ pathname: '/stock/restock', params })}
            >
              Reabastecer
            </Button>
            <Button
              compact
              onPress={() => router.push({ pathname: '/stock/adjust', params })}
            >
              Ajustar
            </Button>
            <Button
              compact
              onPress={() =>
                router.push({ pathname: '/stock/history', params: { skuId: item.skuId, name: params.name } })
              }
            >
              Histórico
            </Button>
          </Card.Actions>
        </Card>
      );
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Buscar por SKU, nome ou código"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Banner
        visible={!!error}
        icon="alert-circle-outline"
        actions={[{ label: 'Tentar novamente', onPress: () => load() }]}
      >
        {error ?? ''}
      </Banner>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !error ? (
              <Text variant="bodyMedium" style={styles.empty}>
                {items.length === 0
                  ? 'Nenhum item de estoque cadastrado.'
                  : 'Nenhum item bate com a busca.'}
              </Text>
            ) : null
          }
        />
      )}

      <FAB
        icon="plus"
        label="Novo item"
        style={styles.fab}
        onPress={() => router.push('/stock/create')}
      />
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text variant="labelSmall" style={styles.muted}>
        {label}
      </Text>
      <Text variant="titleSmall">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge * 2,
    gap: spacing.md,
  },
  card: { borderRadius: 8 },
  cardBody: { gap: spacing.xxs },
  muted: { opacity: 0.6 },
  sku: {
    fontFamily: 'monospace',
    opacity: 0.7,
    marginTop: spacing.xxs,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metric: { gap: spacing.xxs },
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.huge,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
