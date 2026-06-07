import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import type { CartItem as CartItemType } from '@/contexts/CartContext';
import RemoveCartItemModal from './modals/RemoveCartItemModal';

const PRICE_FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type Props = {
  item: CartItemType;
  selected: boolean;
  outOfStock?: boolean;
  onToggleSelect: (skuId: string) => void;
  onIncrease: (skuId: string) => void;
  onDecrease: (skuId: string) => void;
  onRemove: (skuId: string) => void;
};

export default function CartItem({ item, selected, outOfStock, onToggleSelect, onIncrease, onDecrease, onRemove }: Props) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={[styles.container, outOfStock && styles.containerOutOfStock]}>
      <Pressable onPress={() => onToggleSelect(item.skuId)} style={styles.checkbox}>
        <View style={[styles.checkboxInner, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.productName}</Text>
        <View style={styles.meta}>
          {!!item.color && (
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          )}
          {!!item.size && <Text style={styles.metaText}>{item.size}</Text>}
        </View>
        <Text style={styles.price}>{PRICE_FMT.format(item.unitPrice)}</Text>
        {outOfStock && <Text style={styles.outOfStockLabel}>Sem estoque suficiente</Text>}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.qtyBtn} onPress={() => {
          if (item.quantity === 1) setConfirmVisible(true);
          else onDecrease(item.skuId);
        }}>
          <Text style={styles.qtyBtnTxt}>−</Text>
        </Pressable>
        <Text style={styles.qty}>{item.quantity}</Text>
        <Pressable style={styles.qtyBtn} onPress={() => onIncrease(item.skuId)}>
          <Text style={styles.qtyBtnTxt}>+</Text>
        </Pressable>
      </View>

      <RemoveCartItemModal
        visible={confirmVisible}
        productName={item.productName}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { setConfirmVisible(false); onRemove(item.skuId); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 10, gap: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  containerOutOfStock:   { borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  outOfStockLabel:       { fontSize: 11, color: '#EF4444', fontWeight: '600' },
  checkbox:        { padding: 4 },
  checkboxInner:   { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected:{ backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  checkmark:       { color: '#FFF', fontSize: 13, fontWeight: '700' },
  info:            { flex: 1, gap: 4 },
  name:            { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorDot:        { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#E5E7EB' },
  metaText:        { fontSize: 12, color: '#6B7280' },
  price:           { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  actions:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn:          { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  qtyBtnTxt:       { fontSize: 18, fontWeight: '700', color: '#0A0A0A' },
  qty:             { fontSize: 15, fontWeight: '700', color: '#0A0A0A', minWidth: 20, textAlign: 'center' },
});
