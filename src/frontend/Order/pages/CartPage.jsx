import { useState } from "react";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";

function CartPage() {
  // MOCK TEMPORÁRIO (depois integra com carrinho real)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Camiseta", price: 50, quantity: 2 },
    { id: 2, name: "Calça", price: 120, quantity: 1 }
  ]);

  return (
    <div>
      <h1>Carrinho</h1>

      {cartItems.map(item => (
        <CartItem key={item.id} item={item} />
      ))}

      <OrderSummary items={cartItems} />

      <button onClick={() => window.location.href = "/checkout"}>
        Ir para Checkout
      </button>
    </div>
  );
}

export default CartPage;