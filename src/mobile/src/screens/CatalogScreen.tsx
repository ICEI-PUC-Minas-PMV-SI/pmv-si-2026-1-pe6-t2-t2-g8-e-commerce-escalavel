import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput as RNInput,
} from 'react-native';
import { Chip, FAB, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ProductCard } from '@/src/components/ProductCard';
import { catalogService } from '@/src/services/catalogService';
import { useAuth } from '@/src/contexts/AuthContext';
import type { Category, Product } from '@/src/types/catalog';
import { router } from 'expo-router'

const ACCENT = '#C9A96E';
const DARK   = '#0A0A0A';

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
  const router   = useRouter();

  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const firstName = user?.name.split(' ')[0] ?? '';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const isAdmin   = user?.role === 'admin';

  /* ── Carregar categorias (uma vez) ── */
  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await catalogService.getCategories(signal);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      /* silencioso — categorias são complementares */
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    loadCategories(ctrl.signal);
    return () => ctrl.abort();
  }, [loadCategories]);

  /* ── Carregar produtos (re-executa ao mudar filtro de categoria) ── */
  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const filters = activeCatId ? { categoryId: activeCatId } : {};
      const data    = await catalogService.getProducts(filters, signal);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg   = (err as Error).message ?? '';
      const isHtml = msg.includes('<!DOCTYPE') || msg.includes('<html');
      setError(isHtml ? 'Serviço de catálogo indisponível.' : msg || 'Erro ao carregar produtos.');
    }
  }, [activeCatId]);

  useFocusEffect(
    useCallback(() => {
      const ctrl = new AbortController();
      setLoading(true);
      load(ctrl.signal).finally(() => setLoading(false));
      return () => ctrl.abort();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  /* ── Filtro local por texto ── */
  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Admin: excluir produto ── */
  const handleDelete = (product: Product) => {
    Alert.alert('Excluir produto', `Confirmar exclusão de "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await catalogService.deleteProduct(product.id);
            setProducts(prev => prev.filter(p => p.id !== product.id));
          } catch (e) {
            Alert.alert('Erro', (e as Error).message || 'Falha ao excluir produto.');
          }
        },
      },
    ]);
  };

  /* ── Admin: pressão longa no card ── */
  const handleLongPress = (product: Product) => {
    if (!isAdmin) return;
    Alert.alert(product.name, '', [
      { text: 'Editar',  onPress: () => router.push(`/catalog/admin/product-form?id=${product.id}`) },
      { text: 'Excluir', style: 'destructive', onPress: () => handleDelete(product) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={s.statusBarBg}>
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

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

        {/* Busca */}
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

        {/* Filtro de categorias */}
        {!loading && !error && categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.chipsRow}
            contentContainerStyle={s.chipsContent}
          >
            <Chip
              selected={!activeCatId}
              onPress={() => setActiveCatId(null)}
              style={s.chip}
              selectedColor={DARK}
            >
              Todos
            </Chip>
            {categories.map(cat => (
              <Chip
                key={cat.id}
                selected={activeCatId === cat.id}
                onPress={() => setActiveCatId(cat.id === activeCatId ? null : cat.id)}
                style={s.chip}
                selectedColor={DARK}
              >
                {cat.name}
              </Chip>
            ))}
          </ScrollView>
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
          <Pressable style={s.retryBtn} onPress={() => { setLoading(true); load().finally(() => setLoading(false)); }}>
            <Text style={s.retryTxt}>⟳  Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {/* ── Lista ── */}
      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(p) => router.push(`/catalog/product/${p.id}`)}
              onLongPress={isAdmin ? handleLongPress : undefined}
            />
          )}
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

      {/* ── FAB admin ── */}
      {isAdmin && !loading && !error && (
        <FAB
          icon="plus"
          style={s.fab}
          onPress={() => router.push('/catalog/admin/product-form')}
          color="#FFF"
        />
      )}

    </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  statusBarBg: { flex: 1, backgroundColor: '#0A0A0A' },
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  /* Header */
  header:         { backgroundColor: '#FFF', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  greeting:       { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginBottom: 2 },
  title:          { fontSize: 26, fontWeight: '900', color: DARK, letterSpacing: -0.5 },
  headerBadge:    { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  headerBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#6B7280' },

  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 42, marginBottom: 10 },
  searchIco:   { fontSize: 14, marginRight: 8, opacity: 0.5 },
  searchInput: { flex: 1, fontSize: 14, color: DARK, height: 42, outlineStyle: 'none' } as any,
  searchClear: { color: '#9CA3AF', fontSize: 13, padding: 4 },

  /* Category chips */
  chipsRow:     { marginBottom: 8 },
  chipsContent: { gap: 8, paddingVertical: 2 },
  chip:         { backgroundColor: '#F3F4F6' },

  /* List */
  list:      { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 96 },
  row:       { gap: 0, paddingHorizontal: 2 },
  resultTxt: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 6, marginBottom: 8, fontWeight: '500' },

  /* Error */
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  errorIcon:  { fontSize: 52, marginBottom: 4 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  errorMsg:   { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  retryBtn:   { marginTop: 8, backgroundColor: DARK, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryTxt:   { color: '#FFF', fontSize: 14, fontWeight: '700' },

  /* Empty */
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon:  { fontSize: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyHint:  { fontSize: 13, color: '#9CA3AF' },

  /* FAB */
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: DARK },
});
