import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Banner,
  Button,
  Divider,
  Menu,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Category } from '@/src/types/catalog';

const DARK = '#0A0A0A';

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
  const [loading, setLoading]         = useState(isEditing);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

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
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao carregar dados.');
    }
  }, [id, isEditing]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        urlImg: urlImg.trim() || undefined,
        categoryId: categoryId || undefined,
      };
      if (isEditing) {
        await catalogService.updateProduct(id!, data);
      } else {
        await catalogService.createProduct(data);
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
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Banner visible={!!error} icon="alert-circle-outline" actions={[]}>
            {error ?? ''}
          </Banner>

          <TextInput
            mode="outlined"
            label="Nome do produto *"
            value={name}
            onChangeText={setName}
            autoFocus={!isEditing}
          />

          <TextInput
            mode="outlined"
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <TextInput
            mode="outlined"
            label="URL da imagem"
            value={urlImg}
            onChangeText={setUrlImg}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="ex: produto-foto.jpg"
          />

          {/* Category picker */}
          <View>
            <Text style={s.label}>Categoria</Text>
            <Menu
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={
                <Pressable
                  onPress={() => setMenuOpen(true)}
                  style={({ pressed }) => [s.picker, pressed && s.pickerPressed]}
                >
                  <Text style={s.pickerTxt}>
                    {selectedCategory?.name ?? 'Selecionar categoria'}
                  </Text>
                  <Text style={s.pickerArrow}>▾</Text>
                </Pressable>
              }
              contentStyle={s.menuContent}
            >
              <Menu.Item
                title="Sem categoria"
                onPress={() => { setCategoryId(''); setMenuOpen(false); }}
              />
              <Divider />
              {categories.map(cat => (
                <Menu.Item
                  key={cat.id}
                  title={cat.name}
                  onPress={() => { setCategoryId(cat.id); setMenuOpen(false); }}
                  titleStyle={cat.id === categoryId ? { color: DARK, fontWeight: '700' } : undefined}
                />
              ))}
            </Menu>
          </View>

          <View style={s.actions}>
            <Button
              mode="text"
              onPress={() => router.back()}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              buttonColor={DARK}
            >
              {isEditing ? 'Salvar' : 'Criar produto'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1 },
  body:   { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  label:  { fontSize: 12, color: '#6B7280', marginBottom: spacing.xs, fontWeight: '600' },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#79747E', borderRadius: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2,
    backgroundColor: '#FFF',
  },
  pickerPressed: { backgroundColor: '#F8F9FA' },
  pickerTxt:     { fontSize: 14, color: '#1C1B1F', flex: 1 },
  pickerArrow:   { fontSize: 12, color: '#6B7280' },
  menuContent:   { backgroundColor: '#FFF' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
