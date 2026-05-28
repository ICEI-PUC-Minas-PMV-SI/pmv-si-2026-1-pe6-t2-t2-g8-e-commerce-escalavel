import { Modal, View, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onGoToOrders: () => void;
};

export default function OrderSuccessModal({
  visible,
  onClose,
  onGoToOrders,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Pedido realizado com sucesso!
          </Text>

          <Pressable
            onPress={onGoToOrders}
            style={{
              backgroundColor: 'green',
              padding: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Ver meus pedidos
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: '#333',
              padding: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Fechar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}