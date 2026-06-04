import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Product } from '@/src/types/catalog';

const DARK = '#0A0A0A';

function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.img} />
      <View style={sk.line1} />
      <View style={sk.line2} />
    </View>
  );
}
const sk = StyleSheet.create({
  card:  { flex: 1, margin: 6, borderRadius: 12, backgroundColor: '#FFF', overflow: 'hidden', elevation: 1 },
  img:   { height: 150, backgroundColor: '#F3F4F6' },
  line1: { height: 12, backgroundColor: '#F3F4F6', margin: 10, marginBottom: 6, borderRadius: 6 },
  line2: { height: 10, backgroundColor: '#F3F4F6', margin: 10, marginTop: 0, width: '60%', borderRadius: 6 },
});

export default function ProductsByCategoryScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useLayoutEffect(() => {
    if (categoryName) {
      navigation.setOptions({ title: decodeURIComponent(categoryName) });
    }
  }, [categoryName, navigation]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const data = await catalogService.getProducts({ categoryId }, signal);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = (err as Error).message ?? '';
      const isHtml = msg.includes('<!DOCTYPE') || msg.includes('<html');
      setError(isHtml ? 'Serviço de catálogo indisponível.' : msg || 'Erro ao carregar produtos.');
    }
  }, [categoryId]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    load(ctrl.signal).finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      {loading && (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={i => String(i)}
          renderItem={() => <SkeletonCard />}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          scrollEnabled={false}
        />
      )}

      {!loading && !!error && (
        <View style={s.center}>
          <Text style={s.errorIcon}>📡</Text>
          <Text style={s.errorTitle}>Serviço indisponível</Text>
          <Text style={s.errorMsg}>{error}</Text>
          <Pressable
            style={s.retryBtn}
            onPress={() => { setLoading(true); load().finally(() => setLoading(false)); }}
          >
            <Text style={s.retryTxt}>⟳  Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(p) => router.push(`/catalog/product/${p.id}`)}
            />
          )}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK} />}
          ListHeaderComponent={
            products.length > 0 ? (
              <Text style={s.resultTxt}>{products.length} produto{products.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyIcon}>🛍</Text>
              <Text style={s.emptyTitle}>Nenhum produto nesta categoria</Text>
              <Text style={s.emptyHint}>Puxe para baixo para atualizar</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#F3F4F6' },
  list:      { padding: 10, paddingBottom: 32 },
  row:       { gap: 0 },
  resultTxt: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 6, marginBottom: 8, fontWeight: '500' },

  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, paddingTop: 80 },
  errorIcon:  { fontSize: 52, marginBottom: spacing.xs },
  errorTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  errorMsg:   { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  retryBtn:   { marginTop: spacing.sm, backgroundColor: DARK, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  retryTxt:   { color: '#FFF', fontSize: 14, fontWeight: '700' },
  emptyIcon:  { fontSize: 52, marginBottom: spacing.xs },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyHint:  { fontSize: 13, color: '#9CA3AF' },
});
