import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { orderService, Order } from '@/src/services/orderService';

const PIX_FAKE_CODE = "00020126580014br.gov.bcb.pix0136ecom-fake-key-pix-pagamento5204000053039865802BR5925ECOM LOJA6009SAO PAULO62070503***6304ABCD";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);
  const [declinedOrderId, setDeclinedOrderId] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
    paymentMethod: 'credit_card',
  });

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function runPayment(orderId: string) {
    const { order, declined } = await orderService.payOrder(orderId, form.paymentMethod);
    if (declined) {
      setDeclinedOrderId(orderId);
    } else {
      setPaidOrder(order);
      clearCart();
    }
  }

  async function handleSubmit() {
    if (!user?.id) {
      setError('Você precisa estar logado para finalizar o pedido.');
      return;
    }
    if (!items || items.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdOrder = await orderService.createOrder({
        customerId: user.id,
        items: items.map(item => ({ skuId: item.skuId, quantity: item.quantity })),
      });
      await runPayment(createdOrder.id);
    } catch (err) {
      console.error(err);
      setError('Erro ao finalizar pedido.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (!declinedOrderId) return;
    setLoading(true);
    setError(null);
    try {
      await runPayment(declinedOrderId);
      setDeclinedOrderId(null);
    } catch (err) {
      setError('Erro ao tentar novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyPix() {
    await Clipboard.setStringAsync(PIX_FAKE_CODE);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }

  const isPix = form.paymentMethod === 'pix';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Checkout</Text>

        <Card style={styles.card}>
          <Card.Title title="Dados pessoais" />
          <Card.Content>
            <TextInput label="Nome completo" value={form.name} onChangeText={(v) => handleChange('name', v)} style={styles.input} />
            <TextInput label="Email" value={form.email} onChangeText={(v) => handleChange('email', v)} style={styles.input} />
            <TextInput label="CPF" value={form.cpf} onChangeText={(v) => handleChange('cpf', v)} style={styles.input} />
            <TextInput label="Telefone" value={form.phone} onChangeText={(v) => handleChange('phone', v)} style={styles.input} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Endereço" />
          <Card.Content>
            <TextInput label="CEP" value={form.cep} onChangeText={(v) => handleChange('cep', v)} style={styles.input} />
            <TextInput label="Cidade" value={form.city} onChangeText={(v) => handleChange('city', v)} style={styles.input} />
            <TextInput label="Bairro" value={form.neighborhood} onChangeText={(v) => handleChange('neighborhood', v)} style={styles.input} />
            <TextInput label="Rua" value={form.street} onChangeText={(v) => handleChange('street', v)} style={styles.input} />
            <View style={styles.row}>
              <TextInput label="Número" value={form.number} onChangeText={(v) => handleChange('number', v)} style={[styles.input, styles.flex]} />
              <TextInput label="Complemento" value={form.complement} onChangeText={(v) => handleChange('complement', v)} style={[styles.input, styles.flex]} />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Pagamento" />
          <Card.Content>
            <RadioButton.Group onValueChange={(v) => handleChange('paymentMethod', v)} value={form.paymentMethod}>
              <RadioButton.Item label="Cartão de crédito" value="credit_card" />
              <RadioButton.Item label="Cartão de débito" value="debit_card" />
              <RadioButton.Item label="PIX" value="pix" />
            </RadioButton.Group>

            {isPix && (
              <View style={styles.pixBox}>
                <Text style={styles.pixLabel}>Código PIX (copia e cola):</Text>
                <Text style={styles.pixCode} numberOfLines={3}>{PIX_FAKE_CODE}</Text>
                <Button mode="outlined" onPress={handleCopyPix} style={styles.pixButton}>
                  {pixCopied ? 'Copiado!' : 'Copiar código PIX'}
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summary}>
          {items.map(item => (
            <View key={item.skuId} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>{item.productName} x{item.quantity}</Text>
              <Text style={styles.summaryItem}>R$ {(item.unitPrice * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 'bold' }}>Total</Text>
            <Text style={styles.totalItem}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || items.length === 0}
          style={styles.button}
        >
          Confirmar e pagar
        </Button>

        <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
          Voltar
        </Button>
      </View>

      {/* MODAL SUCESSO */}
      <Portal>
        <Dialog visible={!!paidOrder} onDismiss={() => { setPaidOrder(null); router.replace('/order/purchasedOrders/purchasedOrders'); }}>
          <Dialog.Title>Pagamento aprovado!</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Pedido: {paidOrder?.id}</Paragraph>
            <Paragraph>Status: {paidOrder?.status}</Paragraph>
            {paidOrder?.transactionId && <Paragraph>Transação: {paidOrder.transactionId}</Paragraph>}
            {paidOrder && isPix && (
              <View style={styles.pixBox}>
                <Text style={styles.pixLabel}>Código PIX:</Text>
                <Text style={styles.pixCode} numberOfLines={3}>{PIX_FAKE_CODE}</Text>
                <Button mode="outlined" onPress={handleCopyPix} style={styles.pixButton}>
                  {pixCopied ? 'Copiado!' : 'Copiar código PIX'}
                </Button>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setPaidOrder(null); router.replace('/order/purchasedOrders/purchasedOrders'); }}>
              Ver pedidos
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* MODAL RECUSA */}
        <Dialog visible={!!declinedOrderId} onDismiss={() => { setDeclinedOrderId(null); router.replace('/order/purchasedOrders/purchasedOrders'); }}>
          <Dialog.Title>Pagamento recusado</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Seu pagamento não foi aprovado. Deseja tentar novamente?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleRetry} loading={loading} disabled={loading}>
              Tentar novamente
            </Button>
            <Button onPress={() => { setDeclinedOrderId(null); router.replace('/order/purchasedOrders/purchasedOrders'); }}>
              Ver pedidos
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { padding: 16, paddingBottom: 20, gap: 12 },
  title: { marginBottom: 10, fontWeight: '700' },
  card: { marginBottom: 12 },
  input: { marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  error: { color: 'red', marginTop: 10 },
  footer: { borderTopWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF', padding: 16 },
  summary: { marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryItem: { fontSize: 15, color: 'black', marginBottom: 2 },
  totalItem: { fontSize: 18, fontWeight: '700', color: 'black', marginBottom: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#E5E7EB' },
  button: { marginTop: 10, borderRadius: 12 },
  pixBox: { marginTop: 12, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8, gap: 8 },
  pixLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  pixCode: { fontSize: 11, fontFamily: 'monospace', color: '#1F2937' },
  pixButton: { marginTop: 4 },
});
