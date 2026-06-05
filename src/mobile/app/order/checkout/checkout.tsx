import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/src/contexts/AuthContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total } = useCart();
  const { user } = useAuth();

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
    if (!user) {
      setError('Você precisa estar logado.');
      return;
    }

    if (items.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      router.push('/order/purchasedOrders/purchasedOrders');
    } catch (e) {
      setError('Erro ao finalizar pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      {/* SCROLL DO FORMULÁRIO */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text variant="headlineMedium" style={styles.title}>
          Checkout
        </Text>

        {/* DADOS PESSOAIS */}
        <Card style={styles.card}>
          <Card.Title title="Dados pessoais" />
          <Card.Content>

            <TextInput
              label="Nome completo"
              value={form.name}
              onChangeText={(v) => handleChange('name', v)}
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              style={styles.input}
            />

            <TextInput
              label="CPF"
              value={form.cpf}
              onChangeText={(v) => handleChange('cpf', v)}
              style={styles.input}
            />

            <TextInput
              label="Telefone"
              value={form.phone}
              onChangeText={(v) => handleChange('phone', v)}
              style={styles.input}
            />

          </Card.Content>
        </Card>

        {/* ENDEREÇO */}
        <Card style={styles.card}>
          <Card.Title title="Endereço" />
          <Card.Content>

            <TextInput
              label="CEP"
              value={form.cep}
              onChangeText={(v) => handleChange('cep', v)}
              style={styles.input}
            />

            <TextInput
              label="Cidade"
              value={form.city}
              onChangeText={(v) => handleChange('city', v)}
              style={styles.input}
            />

            <TextInput
              label="Bairro"
              value={form.neighborhood}
              onChangeText={(v) => handleChange('neighborhood', v)}
              style={styles.input}
            />

            <TextInput
              label="Rua"
              value={form.street}
              onChangeText={(v) => handleChange('street', v)}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="Número"
                value={form.number}
                onChangeText={(v) => handleChange('number', v)}
                style={[styles.input, styles.flex]}
              />

              <TextInput
                label="Complemento"
                value={form.complement}
                onChangeText={(v) => handleChange('complement', v)}
                style={[styles.input, styles.flex]}
              />
            </View>

          </Card.Content>
        </Card>

        {/* PAGAMENTO */}
        <Card style={styles.card}>
          <Card.Title title="Pagamento" />
          <Card.Content>

            <RadioButton.Group
              value={form.paymentMethod}
              onValueChange={(value) =>
                setForm(prev => ({ ...prev, paymentMethod: value }))
              }
            >
              <RadioButton.Item label="Cartão de crédito" value="credit_card" />
              <RadioButton.Item label="Cartão de débito" value="debt_card" />
              <RadioButton.Item label="PIX" value="pix" />
            </RadioButton.Group>

          </Card.Content>
        </Card>

        {/* ERRO */}
        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

      </ScrollView>

      {/* FOOTER FIXO */}
      <View style={styles.footer}>

        {/* RESUMO */}
        <View style={styles.summary}>

          {items.map(item => (
            <View key={item.productId} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                {item.productName} x{item.quantity}
              </Text>

              <Text style={styles.summaryItem}>
                R$ {(item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              Total
            </Text>
            <Text style={styles.totalItem} variant="titleMedium">
              R$ {total.toFixed(2)}
            </Text>
          </View>

        </View>

        {/* BOTÕES */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || items.length === 0}
          labelStyle={{ fontSize: 17, fontWeight: '600', marginTop: 12, marginBottom: 14 }}
          style={styles.button}
        >
          Confirmar pedido
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          labelStyle={{ fontSize: 17, fontWeight: '600' }}
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