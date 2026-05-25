import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Banner, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';

export default function RestockScreen() {
  const router = useRouter();
  const { skuId, name, available } = useLocalSearchParams<{
    skuId: string;
    name?: string;
    available?: string;
  }>();
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Quantidade deve ser inteiro > 0.');
      return;
    }

    setSubmitting(true);
    try {
      await stockService.restock(skuId, { quantity: qty });
      router.back();
    } catch (err) {
      setError((err as Error).message || 'Falha ao reabastecer.');
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

          {name ? <Text variant="titleMedium">{name}</Text> : null}
          <Text variant="bodySmall" style={styles.sku} numberOfLines={1}>
            {skuId}
          </Text>
          <Text variant="bodyMedium">
            Disponível atual: <Text style={styles.bold}>{available ?? '—'}</Text>
          </Text>

          <TextInput
            mode="outlined"
            label="Quantidade a adicionar"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
          <HelperText type="info" visible>
            Inteiro maior que 0.
          </HelperText>

          <View style={styles.actions}>
            <Button mode="text" onPress={() => router.back()} disabled={submitting}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting}>
              Reabastecer
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.sm },
  sku: { fontFamily: 'monospace', opacity: 0.7 },
  bold: { fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
