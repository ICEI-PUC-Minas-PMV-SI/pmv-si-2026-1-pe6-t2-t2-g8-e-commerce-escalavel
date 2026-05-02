import { useState } from "react";
import CartItem from "../components/CartItem";
import "./pages-styles/CartPage.css";
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
    <div className="cart-page">

      {/* ITENS */}
      <div className="cart-items">
        <h1>Carrinho</h1>

        {cartItems.length === 0 ? (
          <p>Seu carrinho está vazio</p>
        ) : (
          cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
              onToggleSelect={toggleSelectItem}
            />
          ))
        )}
      </div>

      {/* RESUMO FIXO */}
      <div className="cart-summary">

        <h2>Resumo do pedido</h2>

        <div className="summary-items">
          {cartItems
            .filter(item => item.selected)
            .map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x{item.quantity}</span>
                <span>R$ {item.price * item.quantity}</span>
              </div>
            ))}
        </div>

        <div className="summary-total">
          <span>Total</span>
          <strong>R$ {total}</strong>
        </div>

        <button
          className="checkout-button"
          onClick={() => navigate("/checkout")}
          disabled={total === 0}
        >
          Finalizar compra
        </button>

      </div>

    </div>
  );
}

export default CartPage;