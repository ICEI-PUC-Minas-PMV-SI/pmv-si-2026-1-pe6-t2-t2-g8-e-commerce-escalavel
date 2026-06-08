import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveImageUri } from '@/shared/helpers';
import { useAuth } from '@/src/contexts/AuthContext';
import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Product, Sku, Variant } from '@/src/types/catalog';
import { useCart } from '@/contexts/CartContext';

const ACCENT = '#C9A96E';
const DARK = '#0A0A0A';

const PRICE_FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function minPrice(product: Product): number | null {
  const prices = (product.variants ?? [])
    .flatMap((v) => v.skus ?? [])
    .map((s) => s.price)
    .filter((p): p is number => typeof p === 'number');
  return prices.length ? Math.min(...prices) : null;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);

  const isAdmin = user?.role === 'admin';

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    setError(null);
    try {
      const data = await catalogService.getProductById(id, signal);
      setProduct(data);
      setSelectedVariant(null);
      setSelectedSku(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Erro ao carregar produto.');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const ctrl = new AbortController();
      setLoading(true);
      load(ctrl.signal).finally(() => setLoading(false));
      return () => ctrl.abort();
    }, [load])
  );

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedSku(null);
  };

  const handleAddToCart = () => {
    if (!product || !selectedSku) return;
    addItem({
      skuId: selectedSku.id,
      productId: product.id,
      productName: product.name,
      unitPrice: selectedSku.price,
      quantity,
      size: selectedSku.size ?? '',
      color: selectedVariant?.color ?? '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAdminEdit = () => {
    router.push(`/catalog/admin/product-form?id=${id}`);
  };

  const handleAdminDelete = () => {
    if (!product) return;
    Alert.alert('Excluir produto', `Confirmar exclusão de "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await catalogService.deleteProduct(product.id);
            router.back();
          } catch (err) {
            Alert.alert('Erro', (err as Error).message || 'Falha ao excluir produto.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={DARK} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={s.center}>
        <Text style={s.errorIcon}>📡</Text>
        <Text style={s.errorTitle}>{error || 'Produto não encontrado'}</Text>
        <Button onPress={() => { setLoading(true); load().finally(() => setLoading(false)); }}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  const imageUri = resolveImageUri(product.urlImg);
  const showImage = !!imageUri && !imageFailed;
  const displayPrice = selectedSku
    ? PRICE_FMT.format(selectedSku.price)
    : minPrice(product) !== null
      ? `A partir de ${PRICE_FMT.format(minPrice(product)!)}`
      : 'Indisponível';

  const variants = product.variants ?? [];
  const skus = selectedVariant?.skus ?? [];

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Imagem */}
        <View style={s.imageWrap}>
          {showImage ? (
            <Image
              source={{ uri: imageUri! }}
              style={s.image}
              contentFit="cover"
              transition={200}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={[s.image, s.imagePlaceholder]}>
              <Text style={s.imagePlaceholderTxt}>📷</Text>
            </View>
          )}
        </View>

        <View style={s.body}>
          {/* Categoria */}
          {product.category?.name ? (
            <Text style={s.category}>{product.category.name.toUpperCase()}</Text>
          ) : null}

          {/* Nome */}
          <Text style={s.name}>{product.name}</Text>

          {/* Preço */}
          <Text style={s.price}>{displayPrice}</Text>

          {/* Descrição */}
          {product.description ? (
            <>
              <Divider style={s.divider} />
              <Text style={s.sectionLabel}>Descrição</Text>
              <Text style={s.description}>{product.description}</Text>
            </>
          ) : null}

          {/* Variantes (cor) */}
          {variants.length > 0 && (
            <>
              <Divider style={s.divider} />
              <Text style={s.sectionLabel}>Cor</Text>
              <View style={s.variantRow}>
                {variants.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => handleVariantSelect(v)}
                    style={[
                      s.variantBtn,
                      selectedVariant?.id === v.id && s.variantBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        s.variantBtnTxt,
                        selectedVariant?.id === v.id && s.variantBtnTxtSelected,
                      ]}
                    >
                      {v.color ?? `Opção ${variants.indexOf(v) + 1}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* SKUs (tamanho) */}
          {selectedVariant && skus.length > 0 && (
            <>
              <Divider style={s.divider} />
              <Text style={s.sectionLabel}>Tamanho</Text>
              <View style={s.skuRow}>
                {skus.map((sku) => (
                  <Chip
                    key={sku.id}
                    selected={selectedSku?.id === sku.id}
                    onPress={() => setSelectedSku(sku)}
                    style={s.skuChip}
                    selectedColor={ACCENT}
                  >
                    {sku.size ?? sku.code ?? sku.id.slice(0, 6)}
                    {' · '}
                    {PRICE_FMT.format(sku.price)}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {/* Quantidade */}
          {selectedSku && (
            <>
              <Divider style={s.divider} />
              <Text style={s.sectionLabel}>Quantidade</Text>
              <View style={s.qtyRow}>
                <Pressable
                  style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
                  onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={s.qtyBtnTxt}>−</Text>
                </Pressable>
                <Text style={s.qtyVal}>{quantity}</Text>
                <Pressable
                  style={s.qtyBtn}
                  onPress={() => setQuantity(q => q + 1)}
                >
                  <Text style={s.qtyBtnTxt}>+</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <>
              <Divider style={s.divider} />
              <View style={s.adminRow}>
                <Button
                  mode="outlined"
                  icon="pencil"
                  onPress={handleAdminEdit}
                  style={s.adminBtn}
                >
                  Editar
                </Button>
                <Button
                  mode="outlined"
                  icon="trash-can-outline"
                  onPress={handleAdminDelete}
                  style={[s.adminBtn, s.adminBtnDelete]}
                  textColor="#EF4444"
                >
                  Excluir
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Botão fixo no fundo */}
      <View style={s.footer}>
        <Button
          mode="contained"
          style={s.cartBtn}
          contentStyle={s.cartBtnContent}
          disabled={!selectedSku}
          onPress={handleAddToCart}
          buttonColor={added ? '#22C55E' : DARK}
        >
          {added ? '✓  Adicionado ao carrinho' : selectedSku ? 'Adicionar ao carrinho' : 'Selecione uma opção'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },

  /* Imagem */
  imageWrap:          { width: '100%', aspectRatio: 1, backgroundColor: '#FFF' },
  image:              { width: '100%', height: '100%' },
  imagePlaceholder:   { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  imagePlaceholderTxt:{ fontSize: 64 },

  /* Body */
  body:         { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, padding: spacing.xl, gap: spacing.sm },
  category:     { fontSize: 11, fontWeight: '700', color: ACCENT, letterSpacing: 1.5 },
  name:         { fontSize: 24, fontWeight: '900', color: DARK, lineHeight: 30 },
  price:        { fontSize: 20, fontWeight: '800', color: DARK, marginTop: spacing.xs },
  divider:      { marginVertical: spacing.md },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  description:  { fontSize: 14, color: '#374151', lineHeight: 22 },

  /* Variantes */
  variantRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variantBtn:        { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  variantBtnSelected:{ borderColor: DARK, backgroundColor: DARK },
  variantBtnTxt:     { fontSize: 13, fontWeight: '600', color: '#374151' },
  variantBtnTxtSelected: { color: '#FFF' },

  /* SKUs */
  skuRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skuChip: { backgroundColor: '#F3F4F6' },

  /* Quantidade */
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  qtyBtn:        { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  qtyBtnDisabled:{ opacity: 0.4 },
  qtyBtnTxt:     { fontSize: 20, fontWeight: '700', color: DARK },
  qtyVal:        { fontSize: 18, fontWeight: '800', color: DARK, minWidth: 32, textAlign: 'center' },

  /* Admin */
  adminRow:      { flexDirection: 'row', gap: spacing.md },
  adminBtn:      { flex: 1 },
  adminBtnDelete:{ borderColor: '#EF4444' },

  /* Erros */
  errorIcon:  { fontSize: 48 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: DARK, textAlign: 'center' },

  /* Footer */
  footer:         { backgroundColor: '#FFF', padding: spacing.lg, borderTopWidth: 1, borderTopColor: '#F3F4F6', elevation: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  cartBtn:        { borderRadius: 12 },
  cartBtnContent: { height: 52 },
});
