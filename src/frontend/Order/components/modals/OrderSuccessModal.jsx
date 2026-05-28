import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();

  return (
    <Modal onClose={onClose}>
      <h2>Pedido realizado com sucesso!</h2>

      <p><strong>ID:</strong> {order?.id}</p>
      <p><strong>Status:</strong> {order?.status}</p>

      <button onClick={() => navigate("/orders")}>
        Ver meus pedidos
      </button>

      <button onClick={onClose}>
        Fechar
      </button>
    </Modal>
  );
}

export default OrderSuccessModal;