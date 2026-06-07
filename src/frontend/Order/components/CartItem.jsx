import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'

async function fetchAvailableQty(skuId) {
  if (!skuId) return null
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${BASE_URL}/stock/${skuId}`, { headers })
    if (res.status === 404) return 0
    if (!res.ok) return null
    const body = await res.json()
    const item = body?.data ?? body
    return typeof item?.quantityAvailable === 'number' ? item.quantityAvailable : null
  } catch {
    return null
  }
}

function isCssColor(value) {
  if (!value) return false
  try {
    const el = document.createElement('span')
    el.style.color = value
    return el.style.color !== ''
  } catch {
    return false
  }
}

function CartItem({ item, isSelected, onRemove, onUpdateQuantity, onToggleSelect }) {
  const [showModal, setShowModal] = useState(false);
  // null = desconhecido (sem restrição), number = limite máximo
  const [maxQty, setMaxQty] = useState(null);
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    if (!item.skuId) return
    fetchAvailableQty(item.skuId).then(qty => setMaxQty(qty))
  }, [item.skuId])

  const subtotal = item.price * item.quantity;
  const isColorCss = isCssColor(item.variant)
  const canIncrease = maxQty === null || item.quantity < maxQty

  const handleIncrease = () => {
    if (!canIncrease) {
      setAtLimit(true)
      setTimeout(() => setAtLimit(false), 2500)
      return
    }
    onUpdateQuantity(item.id, item.quantity + 1)
    setAtLimit(false)
  }

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

          <Link to={`/products/${item.productId}`}>
            <div className="w-25 h-25 bg-gray-100 rounded-md" />
          </Link>

          <div className="flex flex-col gap-3">

            <Link
              to={`/products/${item.productId}`}
              className="text-md font-medium text-gray-900 hover:underline"
            >
              {item.name}
            </Link>

            {/* cor e tamanho */}
            {(item.variant || item.sku) && (
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                {item.variant && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 shrink-0"
                      style={isColorCss ? { backgroundColor: item.variant } : { backgroundColor: '#e5e7eb' }}
                    />
                    {isColorCss ? (
                      <span className="sr-only">{item.variant}</span>
                    ) : (
                      <span>{item.variant}</span>
                    )}
                  </span>
                )}
                {item.variant && item.sku && <span className="text-gray-300">|</span>}
                {item.sku && <span>Tam: <strong className="text-gray-700">{item.sku}</strong></span>}
              </div>
            )}

            {/* quantidade */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>

                <span className="text-sm text-gray-700 min-w-[20px] text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 transition-colors
                    ${canIncrease ? 'border-gray-300 hover:bg-gray-100' : 'border-gray-200 opacity-40 cursor-not-allowed'}`}
                  onClick={handleIncrease}
                >
                  +
                </button>
              </div>

              {atLimit && (
                <p className="text-xs text-red-500">
                  Quantidade máxima em estoque atingida ({maxQty}).
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Subtotal: R$ {subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* direita */}
        <div className="flex flex-col items-center gap-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-5 h-5 accent-black transition-transform duration-150 hover:scale-125 cursor-pointer"
          />
          <button
            onClick={() => setShowModal(true)}
            className="text-black text-xl transition-transform duration-150 hover:scale-125"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* MODAL de confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Remover item?</h2>
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
