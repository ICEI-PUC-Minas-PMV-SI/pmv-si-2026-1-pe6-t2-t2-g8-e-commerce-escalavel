import { Modal, View, Text, Pressable } from 'react-native';

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
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View style={{ backgroundColor: 'white', padding: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Tem certeza que deseja cancelar este pedido?
          </Text>

          <Pressable
            onPress={onConfirm}
            style={{ backgroundColor: 'red', padding: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Sim, cancelar
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            style={{ marginTop: 10, backgroundColor: '#333', padding: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Não
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}