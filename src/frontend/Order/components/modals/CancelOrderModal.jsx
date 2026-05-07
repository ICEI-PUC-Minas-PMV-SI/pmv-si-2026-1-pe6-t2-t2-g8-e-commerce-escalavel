function CancelOrderModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4">

        <h2 className="text-lg font-semibold text-center">
          Cancelar pedido?
        </h2>

        <p className="text-sm text-gray-600 text-center">
          Tem certeza que deseja cancelar este pedido?
        </p>

        <div className="flex gap-3 mt-2">

          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Não
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Sim, cancelar
          </button>

        </div>

      </div>
      
    </div>

  );
}

export default CancelOrderModal;