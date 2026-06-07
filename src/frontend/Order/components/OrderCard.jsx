import { useState } from "react";
import CancelOrderModal from "./modals/CancelOrderModal";

function OrderCard({ order, onViewDetails, onCancel, onDiscard }) {

  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleConfirmCancel = () => {
    setShowModal(false);

    if (onCancel) {
      onCancel(order.id);
    }
  };

  const handleCancelClick = () => {
    if (order.status === "Entregue") {
      setShowWarning(true);
      return;
    }

    setShowModal(true);
  };

  return (
    <>
      <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-sm flex items-center justify-between gap-5 transition hover:scale-[1.02] hover:shadow-md">

        {/* esquerda */}
        <div className="flex items-center gap-4">

          {/* imagem */}
          <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0" />

          {/* infos */}
          <div className="flex flex-col gap-2">

            <h3 className="text-base font-semibold text-gray-900">
              {order.productName}
            </h3>

            <p className="text-sm text-gray-500">
              Pedido #{order.id}
            </p>

            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className="text-black font-medium">
                {order.status}
              </span>
            </p>

            <p className="text-sm text-gray-600">
              Total:{" "}
              <span className="text-black font-medium">
                R$ {order.total}
              </span>
            </p>

            {order.transactionId && (
              <p className="text-xs text-gray-400">
                Transação: {order.transactionId}
              </p>
            )}

          </div>
        </div>

        {/* botão direita */}
        <div className="flex flex-col gap-2 items-end">

          <button
            onClick={onViewDetails}
            className="w-full px-5 py-3 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Página do produto
          </button>

          {/* só mostra cancelar se NÃO estiver cancelado */}
          {order.status.toLowerCase() !== "cancelado" && order.status.toLowerCase() !== "cancelled" && (
            <button
              onClick={handleCancelClick}
              className={`w-full text-sm transition ${order.status.toLowerCase() === "entregue" || order.status.toLowerCase() === "delivered"
                ? "text-gray-400 cursor-not-allowed "
                : "text-red-500 hover:text-red-700 underline underline-offset-4 decoration-1"
                }`}
            >
              Cancelar pedido
            </button>
          )}

          {order.status === "Cancelado" && (
            <button
              onClick={() => onDiscard(order.id)}
              className="w-full text-sm text-gray-500 underline underline-offset-4 decoration-1 hover:text-gray-700 transition"
            >
              Excluir pedido
            </button>
          )}

        </div>
      </div>

      {/* MODAL CANCELAR */}
      <CancelOrderModal
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* MODAL AVISO (ENTREGUE) */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center flex flex-col gap-4">

            <h2 className="text-lg font-semibold">
              Ação não permitida
            </h2>

            <p className="text-sm text-gray-600">
              Pedidos já entregues não podem ser cancelados.
            </p>

            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Entendi
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default OrderCard;