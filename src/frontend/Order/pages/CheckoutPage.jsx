import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";
import { orderApi } from "../../services/Api";
import OrderSuccessModal from "../components/modals/OrderSuccessModal";

function CheckoutPage() {
  const navigate = useNavigate();

  // MOCK do carrinho
  const [cartItems] = useState([
    { id: 1, name: "Camiseta", price: 50, quantity: 2 },
    { id: 2, name: "Calça", price: 120, quantity: 1 }
  ]);

  const [form, setForm] = useState({
    address: "",
    city: "",
    paymentMethod: "credit_card"
  });

  // 🆕 estado do pedido criado
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

      // ❌ REMOVE isso:
      // navigate("/orders", { state: { newOrder: response } });

      // ✅ AGORA:
      setCreatedOrder(response);

    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao finalizar pedido");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>

      <h2>Endereço</h2>
      <input
        name="address"
        placeholder="Endereço"
        onChange={handleChange}
      />
      <input
        name="city"
        placeholder="Cidade"
        onChange={handleChange}
      />

      <h2>Pagamento</h2>
      <select name="paymentMethod" onChange={handleChange}>
        <option value="credit_card">Cartão</option>
        <option value="pix">PIX</option>
      </select>

      <OrderSummary items={cartItems} />

      <button onClick={handleSubmit}>
        Confirmar pedido
      </button>

      {/* 🪟 MODAL DE SUCESSO */}
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