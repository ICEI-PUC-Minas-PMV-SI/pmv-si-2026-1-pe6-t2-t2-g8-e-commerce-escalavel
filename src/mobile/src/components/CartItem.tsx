import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Checkbox,
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import RemoveCartItemModal from '@/src/components/modals/RemoveCartItemModal';

interface Props {
  item: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    size: string;
    color: string;
  };

  selected: boolean;

  onToggleSelect: (id: string) => void;
onIncrease: (productId: string, size: string, color: string) => void;
onDecrease: (productId: string, size: string, color: string) => void;
  onRemove: (productId: string, size: string, color: string) => void;
}

export default function CartItem({
  item,
  selected,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const router = useRouter();

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const subtotal = item.unitPrice * item.quantity;

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>

          {/* Cabeçalho */}
          <View style={styles.header}>

            <Checkbox
              status={selected ? 'checked' : 'unchecked'}
              onPress={() => onToggleSelect(item.productId)}
            />

            <Text
              numberOfLines={2}
              style={styles.productName}
            >
              {item.productName}
            </Text>

            <IconButton
              icon="arrow-right"
              size={22}

              // ATIVAR NA INTEGRAÇÃO
              onPress={() => {
  console.log('NAVIGATE TO PRODUCT:', item.productId);
  router.push(`/products/${item.productId}`);
}}
              // TEMPORÁRIO
             // onPress={() =>
             //   console.log('Abrir produto', item.productId)
             // }
            />

          </View>

          {/* Corpo */}
          <View style={styles.body}>

            {/* Imagem */}
            <View style={styles.image}>
              <Text style={styles.imageEmoji}>👕</Text>
            </View>

            {/* Informações */}
            <View style={styles.info}>

              <Text style={styles.size}>
                Tamanho: {item.size}
              </Text>

              <Text style={styles.color}>
                Cor: {item.color}
              </Text>

              <Text style={styles.subtotal}>
                Subtotal: R$ {subtotal.toFixed(2)}
              </Text>

              {/* Quantidade */}
              <View style={styles.qtyContainer}>

                <IconButton
                  icon="minus"
                  mode="contained-tonal"
                  size={18}
                  style={styles.qtyButton}
                  onPress={() => onDecrease(item.productId, item.size, item.color)}
                />

                <Text style={styles.quantity}>
                  {item.quantity}
                </Text>

                <IconButton
                  icon="plus"
                  mode="contained-tonal"
                  size={18}
                  style={styles.qtyButton}
                  onPress={() => onIncrease(item.productId, item.size, item.color)}
                />

              </View>

            </View>

            {/* Remover */}
            <IconButton
              icon="trash-can-outline"
              iconColor="#EF4444"
              onPress={() => setShowRemoveModal(true)}
            />

          </View>

        </Card.Content>
      </Card>

      <RemoveCartItemModal
        visible={showRemoveModal}
        productName={item.productName}
        onCancel={() => setShowRemoveModal(false)}
        onConfirm={() => {
          onRemove(item.productId, item.size, item.color)
          setShowRemoveModal(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 0,
    marginRight: 4,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  image: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageEmoji: {
    fontSize: 32,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  size: {
    fontSize: 16,
    color: 'black',
    marginBottom: 4,
  },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },

  qtyButton: {
    margin: 0,
  },

  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },

  subtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  color: {
  fontSize: 16,
  color: 'black',
  marginBottom: 4,
},

});