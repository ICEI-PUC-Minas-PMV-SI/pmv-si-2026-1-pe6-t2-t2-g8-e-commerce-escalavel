import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function DeliveredOrderModal({
  visible,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <Text style={styles.title}>
            Pedido entregue
          </Text>

          <Text style={styles.message}>
            Não é possível cancelar um pedido que já foi entregue.
          </Text>

          <Button
            mode="contained"
            onPress={onClose}
            style={styles.button}
          >
            Entendi
          </Button>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  message: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },

  button: {
    borderRadius: 10,
  },
});