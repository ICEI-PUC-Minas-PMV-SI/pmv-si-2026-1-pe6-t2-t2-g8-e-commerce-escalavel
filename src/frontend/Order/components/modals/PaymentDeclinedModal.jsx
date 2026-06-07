import Modal from "./Modal";

function PaymentDeclinedModal({ order, onRetry, onClose, loading }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4 p-2">
        <h2 className="text-xl font-semibold text-red-600">Pagamento recusado</h2>

        <p className="text-sm text-gray-600">
          Seu pagamento não foi aprovado. Verifique os dados ou tente outro método.
        </p>

        <div className="text-sm text-gray-500">
          <p><strong>ID do pedido:</strong> {order?.id}</p>
          <p><strong>Status:</strong> {order?.status}</p>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={onRetry}
            disabled={loading}
            className="flex-1 bg-black text-white py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Processando..." : "Tentar novamente"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm"
          >
            Ver pedidos
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentDeclinedModal;
