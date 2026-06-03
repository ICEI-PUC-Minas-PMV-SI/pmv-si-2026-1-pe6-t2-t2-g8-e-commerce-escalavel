import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Banner, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';

const UUID_RE = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export default function CreateStockScreen() {
  const router = useRouter();
  const [skuId, setSkuId] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const trimmed = skuId.trim();
    if (!UUID_RE.test(trimmed)) {
      setError('SKU inválido. Informe um UUID.');
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
      await stockService.create({ skuId: trimmed, quantity: qty, costPrice: cost });
      router.back();
    } catch (err) {
      setError((err as Error).message || 'Falha ao criar item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Banner visible={!!error} icon="alert-circle-outline">
            {error ?? ''}
          </Banner>

          <TextInput
            mode="outlined"
            label="SKU (UUID)"
            value={skuId}
            onChangeText={setSkuId}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="00000000-0000-0000-0000-000000000000"
          />

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
            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting}>
              Criar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
