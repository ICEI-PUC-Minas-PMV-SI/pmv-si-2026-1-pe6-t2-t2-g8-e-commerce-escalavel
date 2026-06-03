import { useCallback, useEffect, useState } from 'react';
import {
  FlatList, RefreshControl, StyleSheet, View,
  Pressable, TextInput as RNInput,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { catalogService } from '@/src/services/catalogService';
import { useAuth } from '@/src/contexts/AuthContext';
import type { Product } from '@/src/types/catalog';

const ACCENT = '#C9A96E';
const DARK   = '#0A0A0A';

/* ── Skeleton de loading ── */
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

export function CatalogScreen() {
  const { user } = useAuth();
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState('');

  const firstName = user?.name.split(' ')[0] ?? '';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const data = await catalogService.getProducts({}, signal);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = (err as Error).message ?? '';
      // Evita mostrar HTML bruto de erro 404/500
      const isHtml = msg.includes('<!DOCTYPE') || msg.includes('<html');
      setError(isHtml ? 'Serviço de catálogo indisponível.' : msg || 'Erro ao carregar produtos.');
    }
  }, []);

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

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>{greeting}, {firstName} 👋</Text>
            <Text style={s.title}>Catálogo</Text>
          </View>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeTxt}>{products.length} itens</Text>
          </View>
        </View>

        {/* Search */}
        {!loading && !error && (
          <View style={s.searchBox}>
            <Text style={s.searchIco}>🔍</Text>
            <RNInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar produto..."
              placeholderTextColor="#9CA3AF"
              style={s.searchInput}
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')}>
                <Text style={s.searchClear}>✕</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* ── Loading ── */}
      {loading && (
        <FlatList
          data={[1,2,3,4,5,6]}
          keyExtractor={i => String(i)}
          renderItem={() => <SkeletonCard />}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          scrollEnabled={false}
        />
      )}

      {/* ── Erro ── */}
      {!loading && !!error && (
        <View style={s.errorState}>
          <Text style={s.errorIcon}>📡</Text>
          <Text style={s.errorTitle}>Serviço indisponível</Text>
          <Text style={s.errorMsg}>{error}</Text>
          <Pressable style={s.retryBtn} onPress={() => { setLoading(true); load().finally(() => setLoading(false)) }}>
            <Text style={s.retryTxt}>⟳  Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {/* ── Lista ── */}
      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK} />}
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={s.resultTxt}>{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🛍</Text>
              <Text style={s.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={s.emptyHint}>{search ? 'Tente outro termo de busca' : 'Puxe para baixo para atualizar'}</Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F3F4F6' },

  /* Header */
  header:        { backgroundColor: '#FFF', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  greeting:      { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginBottom: 2 },
  title:         { fontSize: 26, fontWeight: '900', color: DARK, letterSpacing: -0.5 },
  headerBadge:   { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  headerBadgeTxt:{ fontSize: 12, fontWeight: '700', color: '#6B7280' },

  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 42 },
  searchIco:     { fontSize: 14, marginRight: 8, opacity: 0.5 },
  searchInput:   { flex: 1, fontSize: 14, color: DARK, height: 42, outlineStyle: 'none' } as any,
  searchClear:   { color: '#9CA3AF', fontSize: 13, padding: 4 },

  /* List */
  list:          { padding: 10, paddingBottom: 32 },
  row:           { gap: 0 },
  resultTxt:     { fontSize: 12, color: '#9CA3AF', marginHorizontal: 6, marginBottom: 8, fontWeight: '500' },

  /* Error */
  errorState:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  errorIcon:     { fontSize: 52, marginBottom: 4 },
  errorTitle:    { fontSize: 18, fontWeight: '800', color: DARK },
  errorMsg:      { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  retryBtn:      { marginTop: 8, backgroundColor: DARK, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryTxt:      { color: '#FFF', fontSize: 14, fontWeight: '700' },

  /* Empty */
  emptyState:    { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon:     { fontSize: 52, marginBottom: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyHint:     { fontSize: 13, color: '#9CA3AF' },
});
