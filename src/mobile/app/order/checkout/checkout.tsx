import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { orderService } from '@/src/services/orderService';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  console.log("USER:", user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const orderPayload = {
        customerId: user.id,
        items: items.map(item => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await orderService.createOrder(orderPayload);

      console.log('Pedido criado:', createdOrder);

      clearCart();

      router.replace('/order/purchasedOrders/purchasedOrders');

    } catch (error) {
      console.error(error);
      setError('Erro ao finalizar pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>

        <Text variant="headlineMedium" style={styles.title}>
          Checkout
        </Text>

        {/* FORMULÁRIOS (igual ao seu) */}
        <Card style={styles.card}>
          <Card.Title title="Dados pessoais" />
          <Card.Content>
            <TextInput label="Nome completo" value={form.name} onChangeText={(v) => handleChange('name', v)} style={styles.input} />
            <TextInput label="Email" value={form.email} onChangeText={(v) => handleChange('email', v)} style={styles.input} />
            <TextInput label="CPF" value={form.cpf} onChangeText={(v) => handleChange('cpf', v)} style={styles.input} />
            <TextInput label="Telefone" value={form.phone} onChangeText={(v) => handleChange('phone', v)} style={styles.input} />
          </Card.Content>
        </Card>

        {/* restante do seu código permanece igual... */}

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

      </ScrollView>

      <View style={styles.footer}>

        <View style={styles.summary}>
          {items.map(item => (
            <View key={item.skuId} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                {item.productName} x{item.quantity}
              </Text>

              <Text style={styles.summaryItem}>
                R$ {(item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 'bold' }}>Total</Text>
            <Text style={styles.totalItem}>
              R$ {total.toFixed(2)}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || items.length === 0}
          style={styles.button}
        >
          Confirmar pedido
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Voltar
        </Button>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  content: {
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },

  title: {
    marginBottom: 10,
    fontWeight: '700',
  },

  card: {
    marginBottom: 12,
  },

  input: {
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  flex: {
    flex: 1,
  },

  error: {
    color: 'red',
    marginTop: 10,
  },

  footer: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    padding: 16,
  },

  summary: {
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  summaryItem: {
    fontSize: 15,
    color: 'black',
    marginBottom: 2,
  },

  totalItem: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 2,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  button: {
    marginTop: 10,
    borderRadius: 12,
  },
});