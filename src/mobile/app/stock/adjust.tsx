import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Banner, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stockService } from '@/src/services/stockService';
import { spacing } from '@/src/theme';

export default function AdjustScreen() {
  const router = useRouter();
  const { skuId, name, available } = useLocalSearchParams<{
    skuId: string;
    name?: string;
    available?: string;
  }>();
  const availableQty = Number(available ?? 'NaN');
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericDelta = Number(delta);
  const validDelta = Number.isInteger(numericDelta) && numericDelta !== 0;
  const insufficient =
    validDelta &&
    numericDelta < 0 &&
    Number.isFinite(availableQty) &&
    Math.abs(numericDelta) > availableQty;

  const submit = async () => {
    setError(null);
    if (!validDelta) {
      setError('Delta deve ser inteiro diferente de zero.');
      return;
    }
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setError('Motivo deve ter pelo menos 3 caracteres.');
      return;
    }
    if (insufficient) {
      setError(`Estoque insuficiente. Disponível: ${availableQty}.`);
      return;
    }

    setSubmitting(true);
    try {
      await stockService.adjust(skuId, { delta: numericDelta, reason: trimmedReason });
      router.back();
    } catch (err) {
      setError((err as Error).message || 'Falha ao ajustar estoque.');
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
            label="Delta (use sinal negativo para remover)"
            value={delta}
            onChangeText={setDelta}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            mode="outlined"
            label="Motivo"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            maxLength={255}
            placeholder="Ex.: avaria, perda, contagem física"
          />

          {insufficient ? (
            <HelperText type="error" visible>
              Aviso: ajuste excede disponível ({availableQty}).
            </HelperText>
          ) : (
            <HelperText type="info" visible>
              Delta inteiro ≠ 0. Motivo ≥ 3 caracteres.
            </HelperText>
          )}

          <View style={styles.actions}>
            <Button mode="text" onPress={() => router.back()} disabled={submitting}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting}>
              Ajustar
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
