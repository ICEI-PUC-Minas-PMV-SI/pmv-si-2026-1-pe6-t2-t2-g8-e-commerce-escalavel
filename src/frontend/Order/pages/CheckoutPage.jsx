import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../services/Api";
import OrderSuccessModal from "../components/modals/OrderSuccessModal";
import "./pages-styles/CheckoutPage.css";

function CheckoutPage() {
  const navigate = useNavigate();

  const [cartItems] = useState([
    { id: 1, name: "Camiseta", price: 50, quantity: 2 },
    { id: 2, name: "Calça", price: 120, quantity: 1 }
  ]);

  const [form, setForm] = useState({
    address: "",
    city: "",
    paymentMethod: "credit_card"
  });

  const [createdOrder, setCreatedOrder] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const orderData = {
        items: cartItems,
        address: form.address,
        city: form.city,
        paymentMethod: form.paymentMethod
      };

      const response = await orderApi.createOrder(orderData);

      setCreatedOrder(response);

    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao finalizar pedido");
    }
  };

  return (
    <div className="checkout-page">

      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-section">
        <h2>Endereço</h2>

        <input
          className="checkout-input"
          name="address"
          placeholder="Endereço"
          onChange={handleChange}
        />

        <input
          className="checkout-input"
          name="city"
          placeholder="Cidade"
          onChange={handleChange}
        />
      </div>

      <div className="checkout-section">
        <h2>Pagamento</h2>

        <div className="select-wrapper">
          <div className="payment-options">

            <div
              className={`payment-card ${form.paymentMethod === "credit_card" ? "active" : ""}`}
              onClick={() => setForm({ ...form, paymentMethod: "credit_card" })}
            >
              Cartão de crédito
            </div>

            <div
              className={`payment-card ${form.paymentMethod === "debt_card" ? "active" : ""}`}
              onClick={() => setForm({ ...form, paymentMethod: "debt_card" })}
            >
              Cartão de débito
            </div>

            <div
              className={`payment-card ${form.paymentMethod === "pix" ? "active" : ""}`}
              onClick={() => setForm({ ...form, paymentMethod: "pix" })}
            >
              PIX
            </div>

          </div>
        </div>
      </div>

      {/* RESUMO */}

      <div className="checkout-summary">
        {cartItems.map(item => (
          <div key={item.id} className="checkout-summary-item">
            <span>{item.name} x{item.quantity}</span>
            <span>R$ {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <button
        className="checkout-button"
        onClick={handleSubmit}
      >
        Confirmar pedido
      </button>
      <button
        className="checkout-button secondary"
        onClick={() => navigate("/cart")}
      >
        Voltar
      </button>

      {createdOrder && (
        <OrderSuccessModal
          order={createdOrder}
          onClose={() => setCreatedOrder(null)}
        />
      )}

    </div>
  );
}

export default CheckoutPage;