import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, IconButton, Text } from 'react-native-paper';

import type { CartItem as CartItemType } from '@/contexts/CartContext';
import RemoveCartItemModal from '@/src/components/modals/RemoveCartItemModal';

type Props = {
  item: CartItemType;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onIncrease: (skuId: string) => void;
  onDecrease: (skuId: string) => void;
  onRemove: (skuId: string) => void;
};

export default function CartItem({
  item,
  selected,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // chave de seleção alinhada à usada na tela do carrinho
  const selectKey = `${item.productId}-${item.size}-${item.color}`;

  const subtotal = item.unitPrice * item.quantity;

  return (
    <View style={styles.row}>

      <Checkbox
        status={selected ? 'checked' : 'unchecked'}
        onPress={() => onToggleSelect(selectKey)}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.productName}
        </Text>

        <Text style={styles.meta}>
          {item.color} · {item.size}
        </Text>

        <Text style={styles.price}>
          R$ {item.unitPrice.toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.stepper}>
          <IconButton
            icon="minus"
            size={16}
            disabled={item.quantity <= 1}
            onPress={() => onDecrease(item.skuId)}
          />

          <Text style={styles.qty}>{item.quantity}</Text>

          <IconButton
            icon="plus"
            size={16}
            onPress={() => onIncrease(item.skuId)}
          />
        </View>

        <Text style={styles.subtotal}>
          R$ {subtotal.toFixed(2)}
        </Text>

        <IconButton
          icon="trash-can-outline"
          size={18}
          iconColor="#EF4444"
          onPress={() => setShowRemoveModal(true)}
        />
      </View>

      <RemoveCartItemModal
        visible={showRemoveModal}
        productName={item.productName}
        onCancel={() => setShowRemoveModal(false)}
        onConfirm={() => {
          setShowRemoveModal(false);
          onRemove(item.skuId);
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  info: {
    flex: 1,
    paddingHorizontal: 4,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
  },

  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  price: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  actions: {
    alignItems: 'flex-end',
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  qty: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },

  subtotal: {
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 2,
  },
});

