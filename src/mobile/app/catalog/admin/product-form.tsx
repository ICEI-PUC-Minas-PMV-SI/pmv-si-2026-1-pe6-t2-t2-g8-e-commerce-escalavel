import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Banner,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Category, Sku, Variant } from '@/src/types/catalog';

const DARK = '#0A0A0A';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#607D8B', '#9E9E9E', '#B0BEC5', '#FFB3BA', '#FFDFBA',
  '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D4A5A5', '#A8D8EA', '#AA96DA',
];

type DraftSku = { id?: string; size: string; code: string; price: string; originalPrice?: string };
type DraftVariant = { id?: string; color: string; skus: DraftSku[] };

function emptyVariant(): DraftVariant {
  return { color: '', skus: [] };
}
function emptySku(): DraftSku {
  return { size: '', code: '', price: '' };
}

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const isEditing = !!id;

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [urlImg, setUrlImg]           = useState('');
  const [categoryId, setCategoryId]   = useState('');
  const [categories, setCategories]   = useState<Category[]>([]);
  const [menuOpen, setMenuOpen]       = useState(false);

  const [variants, setVariants]       = useState<DraftVariant[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [colorPickerVariant, setColorPickerVariant] = useState<number | null>(null);

  const [loading, setLoading]       = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Produto' : 'Novo Produto' });
  }, [isEditing, navigation]);

  const loadData = useCallback(async () => {
    try {
      const [cats, product] = await Promise.all([
        catalogService.getCategories(),
        isEditing ? catalogService.getProductById(id!) : Promise.resolve(null),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      if (product) {
        setName(product.name ?? '');
        setDescription(product.description ?? '');
        setUrlImg(product.urlImg ?? '');
        setCategoryId(product.category?.id ?? '');
        const draftVariants: DraftVariant[] = (product.variants ?? []).map((v: Variant) => ({
          id: v.id,
          color: v.color ?? '',
          skus: (v.skus ?? []).map((s: Sku) => ({
            id: s.id,
            size: s.size ?? '',
            code: s.code ?? '',
            price: String(s.price ?? ''),
            originalPrice: String(s.price ?? ''),
          })),
        }));
        setVariants(draftVariants);
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao carregar dados.');
    }
  }, [id, isEditing]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // ── Variante helpers ──────────────────────────────────
  const addVariant = () => {
    setVariants(v => [...v, emptyVariant()]);
    setExpandedVariant(variants.length);
  };

  const removeVariant = (vi: number) => {
    setVariants(v => v.filter((_, i) => i !== vi));
    setExpandedVariant(null);
  };

  const updateVariant = (vi: number, field: keyof DraftVariant, value: string) => {
    setVariants(v => v.map((item, i) => i === vi ? { ...item, [field]: value } : item));
  };

  // ── SKU helpers ───────────────────────────────────────
  const addSku = (vi: number) => {
    setVariants(v => v.map((item, i) =>
      i === vi ? { ...item, skus: [...item.skus, emptySku()] } : item
    ));
  };

  const removeSku = (vi: number, si: number) => {
    setVariants(v => v.map((item, i) =>
      i === vi ? { ...item, skus: item.skus.filter((_, j) => j !== si) } : item
    ));
  };

  const updateSku = (vi: number, si: number, field: keyof DraftSku, value: string) => {
    setVariants(v => v.map((item, i) =>
      i === vi
        ? { ...item, skus: item.skus.map((s, j) => j === si ? { ...s, [field]: value } : s) }
        : item
    ));
  };

  // ── Submit ────────────────────────────────────────────
  const submit = async () => {
    setError(null);
    if (!name.trim()) { setError('O nome do produto é obrigatório.'); return; }

    for (const v of variants) {
      if (!v.color.trim()) { setError('Toda variante precisa de uma cor.'); return; }
      for (const s of v.skus) {
        if (!s.size.trim()) { setError('Todo SKU precisa de um tamanho.'); return; }
        if (!s.code.trim()) { setError('Todo SKU precisa de um código.'); return; }
        if (!s.price || Number(s.price) < 0) { setError('Todo SKU precisa de um preço ≥ 0.'); return; }
      }
    }

    setSubmitting(true);
    try {
      const productData = {
        name: name.trim(),
        description: description.trim() || undefined,
        urlImg: urlImg.trim() || undefined,
        categoryId: categoryId || undefined,
      };

      let productId = id!;
      if (isEditing) {
        await catalogService.updateProduct(productId, productData);
      } else {
        const created = await catalogService.createProduct(productData);
        productId = created.id;
      }

      // Salva variantes e SKUs novos (sem id)
      for (const v of variants) {
        if (!v.id) {
          const createdVariant = await catalogService.createVariant(productId, {
            color: v.color.trim(),
          });
          for (const s of v.skus) {
            await catalogService.createSku(createdVariant.id, {
              size: s.size.trim(),
              code: s.code.trim(),
              price: Number(s.price),
            });
          }
        } else {
          // Variante existente — cria SKUs novos e atualiza preço dos existentes
          for (const s of v.skus) {
            if (!s.id) {
              await catalogService.createSku(v.id, {
                size: s.size.trim(),
                code: s.code.trim(),
                price: Number(s.price),
              });
            } else if (s.price !== s.originalPrice) {
              try {
                await catalogService.updateSku(s.id, { price: Number(s.price) });
              } catch {
                // ignora falha de update de preço individual para não bloquear o restante
              }
            }
          }
        }
      }

      router.back();
    } catch (err) {
      setError((err as Error).message || 'Falha ao salvar produto.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  if (loading) {
    return (
      <View style={s.center}>
        <Text style={{ color: '#9CA3AF' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Banner visible={!!error} icon="alert-circle-outline" actions={[]}>
            {error ?? ''}
          </Banner>

          {/* ── Produto ── */}
          <Text variant="titleMedium">Produto</Text>

          <TextInput mode="outlined" label="Nome do produto *" value={name} onChangeText={setName} autoFocus={!isEditing} />
          <TextInput mode="outlined" label="Descrição" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
          <TextInput mode="outlined" label="URL da imagem" value={urlImg} onChangeText={setUrlImg} autoCapitalize="none" autoCorrect={false} />

          <View>
            <Text style={s.label}>Categoria</Text>
            <Menu
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={
                <Pressable onPress={() => setMenuOpen(true)} style={({ pressed }) => [s.picker, pressed && s.pickerPressed]}>
                  <Text style={s.pickerTxt}>{selectedCategory?.name ?? 'Selecionar categoria'}</Text>
                  <Text style={s.pickerArrow}>▾</Text>
                </Pressable>
              }
              contentStyle={s.menuContent}
            >
              <Menu.Item title="Sem categoria" onPress={() => { setCategoryId(''); setMenuOpen(false); }} />
              <Divider />
              {categories.map(cat => (
                <Menu.Item
                  key={cat.id}
                  title={cat.name}
                  onPress={() => { setCategoryId(cat.id); setMenuOpen(false); }}
                  titleStyle={cat.id === categoryId ? { fontWeight: '700' } : undefined}
                />
              ))}
            </Menu>
          </View>

          {/* ── Variantes ── */}
          <Divider style={s.divider} />
          <View style={s.sectionHeader}>
            <Text variant="titleMedium">Variantes (cores)</Text>
            <Button mode="text" compact icon="plus" onPress={addVariant}>Adicionar</Button>
          </View>

          {variants.length === 0 && (
            <Text style={s.emptyHint}>Nenhuma variante. O produto pode ser criado sem variantes e adicionadas depois.</Text>
          )}

          {variants.map((v, vi) => (
            <View key={vi} style={s.variantCard}>
              {/* Cabeçalho da variante */}
              <Pressable
                style={s.variantHeader}
                onPress={() => setExpandedVariant(expandedVariant === vi ? null : vi)}
              >
                <View style={s.variantHeaderLeft}>
                  <View style={[s.colorDot, v.color ? { backgroundColor: v.color.toLowerCase() } : {}]} />
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {v.color || 'Nova variante'} {v.id ? '' : '(novo)'}
                  </Text>
                  {v.skus.length > 0 && (
                    <Chip compact style={s.skuCountChip} textStyle={s.skuCountChipTxt}>{v.skus.length} SKU{v.skus.length > 1 ? 's' : ''}</Chip>
                  )}
                </View>
                <View style={s.variantHeaderRight}>
                  {!v.id && (
                    <IconButton icon="delete-outline" size={18} onPress={() => removeVariant(vi)} />
                  )}
                  <Text style={s.expandIcon}>{expandedVariant === vi ? '▲' : '▼'}</Text>
                </View>
              </Pressable>

              {/* Conteúdo expandido */}
              {expandedVariant === vi && (
                <View style={s.variantBody}>
                  <Text style={s.label}>Cor *</Text>
                  <View style={s.colorPickerRow}>
                    <View style={[s.colorPreview, { backgroundColor: v.color || '#E5E7EB' }]} />
                    <TextInput
                      mode="outlined"
                      label="Hex ou nome da cor"
                      value={v.color}
                      onChangeText={val => updateVariant(vi, 'color', val)}
                      disabled={!!v.id}
                      style={{ flex: 1 }}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {!v.id && (
                      <Button
                        mode="outlined"
                        onPress={() => setColorPickerVariant(vi)}
                        style={s.paletteBtn}
                        icon="palette"
                        compact
                      >
                        Paleta
                      </Button>
                    )}
                  </View>

                  {/* SKUs */}
                  <View style={s.skuHeader}>
                    <Text variant="labelLarge">SKUs (tamanhos)</Text>
                    <Button mode="text" compact icon="plus" onPress={() => addSku(vi)}>Adicionar SKU</Button>
                  </View>

                  {v.skus.length === 0 && (
                    <Text style={s.emptyHint}>Nenhum SKU nesta variante.</Text>
                  )}

                  {v.skus.map((s, si) => (
                    <View key={si} style={s.id ? s_styles.skuRowExisting : s_styles.skuRow}>
                      <View style={s_styles.skuFields}>
                        <TextInput
                          mode="outlined"
                          label="Tamanho *"
                          value={s.size}
                          onChangeText={val => updateSku(vi, si, 'size', val)}
                          style={s_styles.skuSize}
                          disabled={!!s.id}
                        />
                        <TextInput
                          mode="outlined"
                          label="Código *"
                          value={s.code}
                          onChangeText={val => updateSku(vi, si, 'code', val)}
                          style={s_styles.skuCode}
                          autoCapitalize="characters"
                          disabled={!!s.id}
                        />
                        <TextInput
                          mode="outlined"
                          label="Preço"
                          value={s.price}
                          onChangeText={val => updateSku(vi, si, 'price', val)}
                          keyboardType="decimal-pad"
                          style={s_styles.skuPrice}
                        />
                      </View>
                      {!s.id && (
                        <IconButton icon="delete-outline" size={18} onPress={() => removeSku(vi, si)} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* ── Color Picker Modal ── */}
          <Modal
            visible={colorPickerVariant !== null}
            transparent
            animationType="fade"
            onRequestClose={() => setColorPickerVariant(null)}
          >
            <Pressable style={s.modalOverlay} onPress={() => setColorPickerVariant(null)}>
              <Pressable style={s.modalBox} onPress={() => {}}>
                <Text variant="titleMedium" style={{ marginBottom: spacing.md }}>Selecionar cor</Text>
                <View style={s.colorGrid}>
                  {PRESET_COLORS.map(hex => (
                    <TouchableOpacity
                      key={hex}
                      style={[
                        s.colorSwatch,
                        { backgroundColor: hex },
                        colorPickerVariant !== null && variants[colorPickerVariant]?.color === hex && s.colorSwatchSelected,
                      ]}
                      onPress={() => {
                        if (colorPickerVariant !== null) {
                          updateVariant(colorPickerVariant, 'color', hex);
                          setColorPickerVariant(null);
                        }
                      }}
                    />
                  ))}
                </View>
                <Button mode="text" onPress={() => setColorPickerVariant(null)} style={{ marginTop: spacing.sm }}>
                  Fechar
                </Button>
              </Pressable>
            </Pressable>
          </Modal>

          {/* ── Ações ── */}
          <View style={s.actions}>
            <Button mode="text" onPress={() => router.back()} disabled={submitting}>Cancelar</Button>
            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting} buttonColor={DARK}>
              {isEditing ? 'Salvar' : 'Criar produto'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  body:        { padding: spacing.lg, gap: spacing.md },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label:       { fontSize: 12, color: '#6B7280', marginBottom: spacing.xs, fontWeight: '600' },
  picker:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#79747E', borderRadius: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2, backgroundColor: '#FFF' },
  pickerPressed: { backgroundColor: '#F8F9FA' },
  pickerTxt:   { fontSize: 14, color: '#1C1B1F', flex: 1 },
  pickerArrow: { fontSize: 12, color: '#6B7280' },
  menuContent: { backgroundColor: '#FFF' },
  divider:     { marginVertical: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emptyHint:   { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },
  variantCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden' },
  variantHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: '#F9FAFB' },
  variantHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  variantHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  colorDot:    { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#E5E7EB' },
  colorPickerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  colorPreview:   { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  paletteBtn:     { alignSelf: 'center' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox:       { backgroundColor: '#FFF', borderRadius: 16, padding: spacing.xl, width: '85%' },
  colorGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorSwatch:    { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  colorSwatchSelected: { borderWidth: 3, borderColor: '#000' },
  skuCountChip:    {},
  skuCountChipTxt: { fontSize: 11 },
  expandIcon:  { fontSize: 11, color: '#9CA3AF', marginRight: spacing.xs },
  variantBody: { padding: spacing.md, gap: spacing.md, backgroundColor: '#FFF' },
  skuHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions:     { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});

// estilos dos SKUs em objeto separado para evitar conflito de nome com variável `s`
const s_styles = StyleSheet.create({
  skuRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: spacing.sm },
  skuRowExisting: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: spacing.sm, opacity: 0.7 },
  skuFields:      { flex: 1, flexDirection: 'row', gap: spacing.xs },
  skuSize:        { flex: 1.5 },
  skuCode:        { flex: 2 },
  skuPrice:       { flex: 1.5 },
});
