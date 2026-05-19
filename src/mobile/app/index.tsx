import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Banner, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { catalogService } from '@/src/services/catalogService';
import { gridStyles } from '@/src/styles';
import { spacing } from '@/src/theme';
import type { Product } from '@/src/types/catalog';

const layout = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.huge,
  },
});

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const data = await catalogService.getProducts({}, signal);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(
        (err as Error).message ||
          'Erro ao carregar produtos. Verifique a conexão.'
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Surface style={layout.safe} elevation={0}>
      <SafeAreaView style={layout.safe} edges={['bottom']}>
        <View style={layout.header}>
          <Text variant="labelSmall">CATÁLOGO</Text>
          <Text variant="headlineMedium">Produtos</Text>
        </View>

        <Banner
          visible={!!error}
          icon="alert-circle-outline"
          actions={[{ label: 'Tentar novamente', onPress: () => load() }]}
        >
          {error ?? ''}
        </Banner>

        {loading ? (
          <View style={layout.loading}>
            <ActivityIndicator />
          </View>
        ) : null}

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          contentContainerStyle={gridStyles.list}
          columnWrapperStyle={gridStyles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading && !error ? (
              <Text variant="bodyMedium" style={layout.empty}>
                Nenhum produto encontrado.
              </Text>
            ) : null
          }
        />
      </SafeAreaView>
    </Surface>
  );
}
