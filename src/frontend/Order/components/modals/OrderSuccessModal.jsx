import { useState } from "react";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

const PIX_FAKE_CODE = "00020126580014br.gov.bcb.pix0136ecom-fake-key-pix-pagamento5204000053039865802BR5925ECOM LOJA6009SAO PAULO62070503***6304ABCD";

function OrderSuccessModal({ order, paymentMethod, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isPix = paymentMethod === "pix";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_FAKE_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4 p-2">
        <h2 className="text-xl font-semibold text-green-700">Pedido confirmado!</h2>

        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <p><strong>ID do pedido:</strong> {order?.id}</p>
          {order?.transactionId && (
            <p><strong>Transação:</strong> {order.transactionId}</p>
          )}
        </div>

        {isPix && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-600">Código PIX (copia e cola):</p>
            <div className="bg-gray-100 rounded p-2 text-xs break-all font-mono">{PIX_FAKE_CODE}</div>
            <button
              onClick={handleCopyPix}
              className="border border-gray-400 rounded px-3 py-2 text-sm hover:bg-gray-50"
            >
              {copied ? "Copiado!" : "Copiar código PIX"}
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-black text-white py-2 rounded-md text-sm"
          >
            Ver meus pedidos
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OrderSuccessModal;
