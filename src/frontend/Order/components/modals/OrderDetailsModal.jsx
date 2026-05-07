import Modal from "./Modal";
import { orderApi } from "../../../services/Api";

function OrderDetailsModal({ order, onClose }) {

  const handleCancel = async () => {
    try {
      await orderApi.cancelOrder(order.id);
      alert("Pedido cancelado");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao cancelar");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Pedido #{order.id}</h2>

      <p>Status: {order.status}</p>
      <p>Total: R$ {order.total}</p>

      <h3>Itens:</h3>
      {order.items?.map((item, index) => (
        <div key={index}>
          <p>{item.name} - {item.quantity}x</p>
        </div>
      ))}

      <button onClick={handleCancel}>
        Cancelar Pedido
      </button>
    </Modal>
  );
}

export default OrderDetailsModal;