import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Banner, Button, Modal, Text, TextInput } from 'react-native-paper';

import { catalogService } from '@/src/services/catalogService';
import { spacing } from '@/src/theme';
import type { Category } from '@/src/types/catalog';

type Props = {
  visible: boolean;
  category: Category | null;
  onDismiss: () => void;
  onSaved: (category: Category) => void;
};

export function CategoryFormModal({ visible, category, onDismiss, onSaved }: Props) {
  const isEditing = !!category;
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(category?.name ?? '');
      setDescription(category?.description ?? '');
      setError(null);
    }
  }, [visible, category]);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      const saved = isEditing
        ? await catalogService.updateCategory(category!.id, data)
        : await catalogService.createCategory(data);
      onSaved(saved);
    } catch (err) {
      setError((err as Error).message || 'Falha ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={s.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={s.title}>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</Text>

        <Banner visible={!!error} icon="alert-circle-outline" actions={[]}>
          {error ?? ''}
        </Banner>

        <View style={s.fields}>
          <TextInput
            mode="outlined"
            label="Nome *"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TextInput
            mode="outlined"
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={s.actions}>
          <Button mode="text" onPress={onDismiss} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={submit}
            loading={submitting}
            disabled={submitting}
            buttonColor="#0A0A0A"
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0A0A0A', marginBottom: spacing.xs },
  fields: { gap: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
