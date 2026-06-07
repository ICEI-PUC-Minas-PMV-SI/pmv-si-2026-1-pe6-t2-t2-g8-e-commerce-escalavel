import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Banner, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { catalogService } from '@/src/services/catalogService';
import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';
import type { Product, Sku, Variant } from '@/src/types/catalog';

export default function CreateStockScreen() {
  const router = useRouter();

  const [products, setProducts]     = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError]     = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSku, setSelectedSku]         = useState<Sku | null>(null);

  const [quantity,  setQuantity]  = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogService.getProducts().then(async (list) => {
      const detailed = await Promise.all(
        list.map(p => catalogService.getProductById(p.id))
      );
      setProducts(detailed);
    }).catch(e => {
      setCatalogError((e as Error).message || 'Falha ao carregar catálogo.');
    }).finally(() => setLoadingCatalog(false));
  }, []);

  const selectProduct = (p: Product) => {
    setSelectedProduct(p);
    setSelectedVariant(null);
    setSelectedSku(null);
  };

  const selectVariant = (v: Variant) => {
    setSelectedVariant(v);
    setSelectedSku(null);
  };

  const submit = async () => {
    setError(null);
    if (!selectedSku) {
      setError('Selecione um SKU.');
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      setError('Quantidade inicial deve ser inteiro ≥ 0.');
      return;
    }
    const cost = Number(costPrice);
    if (!Number.isFinite(cost) || cost < 0) {
      setError('Custo deve ser ≥ 0.');
      return;
    }

    setSubmitting(true);
    try {
      await stockService.create({ skuId: selectedSku.id, quantity: qty, costPrice: cost });
      router.back();
    } catch (err) {
      setError((err as Error).message || 'Falha ao criar item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCatalog) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator />
        <Text style={{ marginTop: spacing.sm }}>Carregando catálogo…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Banner visible={!!catalogError} icon="alert-circle-outline">
            {catalogError ?? ''}
          </Banner>
          <Banner visible={!!error} icon="alert-circle-outline">
            {error ?? ''}
          </Banner>

          {/* ── 1. Produto ── */}
          <Text variant="labelLarge" style={styles.stepLabel}>1. Produto</Text>
          <View style={styles.chipRow}>
            {products.map(p => (
              <Button
                key={p.id}
                mode={selectedProduct?.id === p.id ? 'contained' : 'outlined'}
                compact
                onPress={() => selectProduct(p)}
                style={styles.chip}
              >
                {p.name}
              </Button>
            ))}
          </View>

          {/* ── 2. Cor (Variante) ── */}
          {selectedProduct && (
            <>
              <Text variant="labelLarge" style={styles.stepLabel}>2. Cor</Text>
              <View style={styles.colorRow}>
                {(selectedProduct.variants ?? []).map(v => (
                  <Pressable
                    key={v.id}
                    onPress={() => selectVariant(v)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: v.color || '#E5E7EB' },
                      selectedVariant?.id === v.id && styles.colorSwatchSelected,
                    ]}
                  />
                ))}
              </View>
            </>
          )}

          {/* ── 3. Tamanho (SKU) ── */}
          {selectedVariant && (
            <>
              <Text variant="labelLarge" style={styles.stepLabel}>3. Tamanho</Text>
              <View style={styles.chipRow}>
                {(selectedVariant.skus ?? []).map(s => (
                  <Button
                    key={s.id}
                    mode={selectedSku?.id === s.id ? 'contained' : 'outlined'}
                    compact
                    onPress={() => setSelectedSku(s)}
                    style={styles.chip}
                  >
                    {s.size ?? s.code ?? s.id.slice(0, 8)}
                  </Button>
                ))}
              </View>
            </>
          )}

          {/* ── SKU selecionado ── */}
          {selectedSku && (
            <View style={styles.skuInfo}>
              <Text variant="bodySmall" style={styles.skuLabel}>SKU selecionado</Text>
              <Text variant="bodyMedium" style={styles.skuCode}>
                {selectedProduct?.name} · {selectedVariant?.color} · {selectedSku.size ?? selectedSku.code}
              </Text>
              <Text variant="bodySmall" style={styles.skuUuid}>{selectedSku.id}</Text>
            </View>
          )}

          {/* ── Quantidade e Custo ── */}
          <View style={styles.row}>
            <View style={styles.col}>
              <TextInput
                mode="outlined"
                label="Quantidade inicial"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.col}>
              <TextInput
                mode="outlined"
                label="Custo (R$)"
                value={costPrice}
                onChangeText={setCostPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <HelperText type="info" visible>
            Quantidade inteira ≥ 0. Custo ≥ 0.
          </HelperText>

          <View style={styles.actions}>
            <Button mode="text" onPress={() => router.back()} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={submit}
              loading={submitting}
              disabled={submitting || !selectedSku}
            >
              Criar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1 },
  center:            { alignItems: 'center', justifyContent: 'center' },
  body:              { padding: spacing.lg, gap: spacing.md },
  stepLabel:         { marginBottom: spacing.xxs },
  chipRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip:              { marginBottom: spacing.xxs },
  colorRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  colorSwatch:       { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#E5E7EB' },
  colorSwatchSelected: { borderWidth: 3, borderColor: '#0A0A0A', transform: [{ scale: 1.18 }] },
  skuInfo:   { backgroundColor: '#F3F4F6', borderRadius: 8, padding: spacing.md, gap: spacing.xxs },
  skuLabel:  { opacity: 0.6 },
  skuCode:   { fontWeight: '700' },
  skuUuid:   { fontFamily: 'monospace', opacity: 0.5, fontSize: 11 },
  row:       { flexDirection: 'row', gap: spacing.md },
  col:       { flex: 1 },
  actions:   { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
