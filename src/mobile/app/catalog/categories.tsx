import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/AuthContext';
import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Category } from '@/src/types/catalog';
import { CategoryFormModal } from '@/src/components/modals/CategoryFormModal';

const ACCENT = '#C9A96E';
const DARK = '#0A0A0A';

function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.line1} />
      <View style={sk.line2} />
    </View>
  );
}
const sk = StyleSheet.create({
  card:  { flex: 1, margin: spacing.sm, borderRadius: 12, backgroundColor: '#FFF', padding: spacing.lg, gap: spacing.sm, elevation: 1 },
  line1: { height: 14, backgroundColor: '#F3F4F6', borderRadius: 6 },
  line2: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 6, width: '60%' },
});

export default function CategoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);

  const isAdmin = user?.role === 'admin';

  const load = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const data = await catalogService.getCategories(signal);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Erro ao carregar categorias.');
    }
  }, []);

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

  const handleCategoryPress = (cat: Category) => {
    router.push(`/catalog/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`);
  };

  const handleLongPress = (cat: Category) => {
    if (!isAdmin) return;
    Alert.alert(cat.name, '', [
      { text: 'Editar', onPress: () => { setEditing(cat); setModalVisible(true); } },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Excluir categoria', `Confirmar exclusão de "${cat.name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir',
              style: 'destructive',
              onPress: async () => {
                try {
                  await catalogService.deleteCategory(cat.id);
                  setCategories(prev => prev.filter(c => c.id !== cat.id));
                } catch (e) {
                  Alert.alert('Erro', (e as Error).message || 'Falha ao excluir categoria.');
                }
              },
            },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSaved = (saved: Category) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModalVisible(false);
    setEditing(null);
  };

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <Portal>
        <CategoryFormModal
          visible={modalVisible}
          category={editing}
          onDismiss={() => { setModalVisible(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      </Portal>

      {/* Loading */}
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

      {/* Erro */}
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

      {/* Lista */}
      {!loading && !error && (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyIcon}>🏷️</Text>
              <Text style={s.emptyTitle}>Nenhuma categoria</Text>
              {isAdmin && <Text style={s.emptyHint}>Toque em + para criar a primeira categoria</Text>}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [s.card, pressed && s.cardPressed]}
              onPress={() => handleCategoryPress(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <View style={s.cardIcon}>
                <Text style={s.cardIconTxt}>🏷️</Text>
              </View>
              <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
              {item.description ? (
                <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              {isAdmin && (
                <Text style={s.adminHint}>Segure para editar</Text>
              )}
            </Pressable>
          )}
        />
      )}

      {isAdmin && (
        <FAB
          icon="plus"
          style={s.fab}
          onPress={openCreate}
          color="#FFF"
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: spacing.sm, paddingBottom: 96 },
  row:  { gap: 0 },

  card:        { flex: 1, margin: spacing.sm, borderRadius: 16, backgroundColor: '#FFF', padding: spacing.lg, gap: spacing.xs, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardPressed: { backgroundColor: '#F8F9FA' },
  cardIcon:    { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  cardIconTxt: { fontSize: 22 },
  cardName:    { fontSize: 15, fontWeight: '800', color: DARK, lineHeight: 20 },
  cardDesc:    { fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 2 },
  adminHint:   { fontSize: 10, color: '#D1D5DB', marginTop: spacing.xs },

  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  errorIcon:  { fontSize: 52, marginBottom: spacing.xs },
  errorTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  errorMsg:   { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  retryBtn:   { marginTop: spacing.sm, backgroundColor: DARK, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  retryTxt:   { color: '#FFF', fontSize: 14, fontWeight: '700' },

  emptyIcon:  { fontSize: 52, marginBottom: spacing.xs },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyHint:  { fontSize: 13, color: '#9CA3AF' },

  fab: { position: 'absolute', right: spacing.xl, bottom: spacing.xl, backgroundColor: DARK },
});
