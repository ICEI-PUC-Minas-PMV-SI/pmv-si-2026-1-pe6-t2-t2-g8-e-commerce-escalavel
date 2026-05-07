import { useState } from "react";
import CartItem from "../components/CartItem";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Camiseta", price: 50, quantity: 2, selected: true },
    { id: 2, name: "Calça", price: 120, quantity: 1, selected: true }
  ]);

  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const toggleSelectItem = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const total = cartItems
    .filter(item => item.selected)
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-6xl mx-auto">

      {/* ITENS */}
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">Carrinho</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">Seu carrinho está vazio</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
                onToggleSelect={toggleSelectItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* RESUMO DO PEDIDO*/}
      <div className="w-full lg:w-80 min-h-[420px] flex flex-col border border-gray-100 rounded-lg p-5 bg-white shadow-sm">

  <h2 className="text-xl font-bold mb-6 text-center">
    Resumo do pedido
  </h2>

  <div className="flex flex-col gap-3 flex-1">
    {cartItems
      .filter(item => item.selected)
      .map(item => (
        <div key={item.id} className="flex justify-between text-md text-gray-600">
          <span>{item.name} x{item.quantity}</span>
          <span className="text-black font-medium">
            R$ {item.price * item.quantity}
          </span>
        </div>
      ))}
  </div>

  <div className="flex justify-between border-t pt-4 mb-5">
    <span className="text-lg font-bold">Total</span>
    <strong className="text-lg">R$ {total}</strong>
  </div>

  <button
    onClick={() => navigate("/checkout")}
    disabled={total === 0}
    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Finalizar compra
  </button>

</div>
    </div>
  );
}

export default CartPage;