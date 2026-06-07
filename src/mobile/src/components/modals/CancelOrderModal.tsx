import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CancelOrderModal({
  visible,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>

        <View style={styles.modal}>

          <Text style={styles.title}>
            Cancelar pedido
          </Text>

          <Text style={styles.message}>
            Tem certeza que deseja cancelar este pedido?
          </Text>

          <Pressable
            style={styles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>
              Sim, cancelar
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>
              Voltar
            </Text>
          </Pressable>

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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 20,
  },

  confirmButton: {
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 10,
  },

  confirmText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },

  cancelButton: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  cancelText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});