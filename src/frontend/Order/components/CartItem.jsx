import { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

function CartItem({ item, onRemove, onUpdateQuantity, onToggleSelect }) {
  const [showModal, setShowModal] = useState(false);

  const subtotal = item.price * item.quantity;

  const handleConfirmRemove = () => {
    onRemove(item.id);
    setShowModal(false);
  };

  return (
    <>
      {/* CARD */}
      <div className="flex items-center justify-between py-6 px-4 bg-white border border-gray-100 rounded-lg shadow-sm">

        {/* esquerda */}
        <div className="flex items-center gap-5">

          <Link to={`/products/${item.id}`}>
            <div className="w-25 h-25 bg-gray-100 rounded-md" />
          </Link>

          <div className="flex flex-col gap-4">

            <Link
              to={`/products/${item.id}`}
              className="text-md font-medium text-gray-900 hover:underline"
            >
              {item.name}
            </Link>

            {/* quantidade */}
            <div className="flex items-center gap-3">

              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black-300 text-gray-600 hover:bg-gray-100"
                onClick={() =>
                  onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
              >
                -
              </button>

              <span className="text-sm text-gray-700 min-w-[20px] text-center">
                {item.quantity}
              </span>

              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black-300 text-gray-600 hover:bg-gray-100"
                onClick={() =>
                  onUpdateQuantity(item.id, item.quantity + 1)
                }
              >
                +
              </button>

            </div>

            <p className="text-xs text-gray-500">
              Subtotal: R$ {subtotal}
            </p>
          </div>
        </div>

        {/* direita */}
        <div className="flex flex-col items-center gap-10">

          {/* checkbox */}
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => onToggleSelect(item.id)}
            className="w-5 h-5 accent-black transition-transform duration-150 hover:scale-125 cursor-pointer"
          />

          {/* lixeira */}
          <button
            onClick={() => setShowModal(true)}
            className="text-black text-xl transition-transform duration-150 hover:scale-125"
          >
            <FiTrash2 />
          </button>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">

            <h2 className="text-lg font-semibold mb-2">
              Remover item?
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja remover <strong>{item.name}</strong> do carrinho?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Remover
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default CartItem;