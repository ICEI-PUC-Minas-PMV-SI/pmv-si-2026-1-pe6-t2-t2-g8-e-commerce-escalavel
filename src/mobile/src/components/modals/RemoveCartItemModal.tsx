import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  productName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RemoveCartItemModal({
  visible,
  productName,
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
        <View style={styles.container}>

          <Text style={styles.title}>
            Remover item?
          </Text>

          <Text style={styles.message}>
            Deseja remover "{productName}" do carrinho?
          </Text>

          <View style={styles.buttons}>

            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.removeButton]}
              onPress={onConfirm}
            >
              <Text style={styles.removeText}>
                Remover
              </Text>
            </Pressable>

          </View>

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

  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  message: {
    fontSize: 15,
    color: 'black',
    marginBottom: 20,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  cancelButton: {
    backgroundColor: '#F3F4F6',
  },

  removeButton: {
    backgroundColor: '#EF4444',
  },

  cancelText: {
    fontWeight: '600',
  },

  removeText: {
    color: '#FFF',
    fontWeight: '600',
  },
});