import { useEffect, useState } from "react";
import CartItem from "../components/CartItem";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCart();
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, [items]);

  const handleRemove = (id) => removeItem(id);
  const handleUpdateQuantity = (id, quantity) => updateQuantity(id, quantity);

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = items
    .filter(item => selectedItems.has(item.id))
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isEmpty = items.length === 0;

  // CASO VAZIO: tela inteira centralizada
  if (isEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => navigate("/products")}
          className="bg-black text-white px-8 py-4 rounded-md hover:bg-gray-800 transition text-lg"
        >
          Voltar às compras
        </button>
      </div>
    );
  }

  // CASO NORMAL: carrinho com itens
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-6xl mx-auto">

      {/* ITENS */}
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">Carrinho</h1>

        <div className="space-y-6">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
              onToggleSelect={toggleSelectItem}
            />
          ))}
        </div>
      </div>

      {/* RESUMO */}
      <div className="w-full lg:w-80 flex flex-col border border-gray-100 rounded-lg p-5 bg-white shadow-sm">

        <h2 className="text-xl font-bold mb-6 text-center">
          Resumo do pedido
        </h2>

        <div className="flex flex-col gap-3 flex-1">
          {items
            .filter(item => selectedItems.has(item.id))
            .map(item => (
              <div key={item.id} className="flex justify-between text-md text-gray-600">
                <span>{item.name} x{item.quantity}</span>
                <span className="text-black font-medium">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
        </div>

        <div className="flex justify-between border-t pt-4 mb-5">
          <span className="text-lg font-bold">Total</span>
          <strong className="text-lg">R$ {total.toFixed(2)}</strong>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          disabled={total === 0}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar compra
        </button>

        <button
          onClick={() => navigate("/products")}
          className="w-full mt-3 border border-gray-300 text-black py-3 rounded-md hover:bg-gray-100 transition"
        >
          Voltar às compras
        </button>

      </div>
    </div>
  );
}

export default CartPage;