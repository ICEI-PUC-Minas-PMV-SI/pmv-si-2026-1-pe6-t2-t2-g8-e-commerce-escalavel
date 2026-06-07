import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { orderApi } from "../../services/api";
import OrderSuccessModal from "../components/modals/OrderSuccessModal";
import PaymentDeclinedModal from "../components/modals/PaymentDeclinedModal";

function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    cep: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    paymentMethod: "credit_card"
  });

  const [paidOrder, setPaidOrder] = useState(null);
  const [declinedOrder, setDeclinedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      setError("É necessário fazer login para concluir o pedido.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        customerId: user.id,
        items: cartItems.map(item => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      };

      const order = await orderApi.createOrder(orderData);
      await processPayment(order.id);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      setError("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (orderId) => {
    const res = await orderApi.payOrder(orderId, form.paymentMethod);
    if (res.status === "PAYMENT_FAILED") {
      setDeclinedOrder(res);
    } else {
      setPaidOrder(res);
      clearCart();
    }
  };

  const handleRetry = async () => {
    if (!declinedOrder) return;
    setLoading(true);
    setError(null);
    try {
      await processPayment(declinedOrder.id);
      setDeclinedOrder(null);
    } catch (err) {
      setError("Erro ao tentar novamente.");
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-10">

      {/* TÍTULO */}
      <h1 className="text-3xl font-semibold">Checkout</h1>

      {/* ENDEREÇO */}
      {/* DADOS PESSOAIS */}
<div className="flex flex-col gap-4">

  <h2 className="text-lg font-medium">Dados pessoais</h2>

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="name"
    placeholder="Nome completo"
    value={form.name}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="email"
    placeholder="Email"
    type="email"
    value={form.email}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="cpf"
    placeholder="CPF"
    value={form.cpf}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="phone"
    placeholder="Telefone"
    value={form.phone}
    onChange={handleChange}
  />

</div>

{/* ENDEREÇO */}
<div className="flex flex-col gap-4">

  <h2 className="text-lg font-medium">Endereço</h2>

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="cep"
    placeholder="CEP"
    value={form.cep}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="city"
    placeholder="Cidade"
    value={form.city}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="neighborhood"
    placeholder="Bairro"
    value={form.neighborhood}
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="street"
    placeholder="Rua"
    value={form.street}
    onChange={handleChange}
  />

  <div className="flex gap-3">

    <input className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
      name="number"
      placeholder="Número"
      value={form.number}
      onChange={handleChange}
    />

    <input className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
      name="complement"
      placeholder="Complemento"
      value={form.complement}
      onChange={handleChange}
    />

  </div>

</div>

      {/* PAGAMENTO */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Pagamento</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div
            onClick={() => setForm({ ...form, paymentMethod: "credit_card" })}
            className={`border rounded-md p-3 text-center cursor-pointer transition transition transform hover:scale-[1.02] ${
              form.paymentMethod === "credit_card"
                ? "border-black bg-black text-white"
                : "border-gray-400"
            }`}
          >
            Cartão de crédito
          </div>

          <div
            onClick={() => setForm({ ...form, paymentMethod: "debit_card" })}
            className={`border rounded-md p-3 text-center cursor-pointer transition transition transform hover:scale-[1.02] ${
              form.paymentMethod === "debit_card"
                ? "border-black bg-black text-white"
                : "border-gray-400"
            }`}
          >
            Cartão de débito
          </div>

          <div
            onClick={() => setForm({ ...form, paymentMethod: "pix" })}
            className={`border rounded-md p-3 text-center cursor-pointer transition transition transform hover:scale-[1.02] ${
              form.paymentMethod === "pix"
                ? "border-black bg-black text-white"
                : "border-gray-400"
            }`}
          >
            PIX
          </div>

        </div>
      </div>

      {/* RESUMO */}
      <div className="border border-gray-100 rounded-lg p-5 bg-gray-50 shadow-sm flex flex-col gap-3">

        {cartItems.length === 0 ? (
          <p className="text-sm text-gray-500">Seu carrinho está vazio.</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.name} x{item.quantity}</span>
              <span className="text-black font-medium">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))
        )}

        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">Total</span>
          <strong className="text-lg">R$ {total.toFixed(2)}</strong>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm border border-red-200 bg-red-50 rounded-md p-3">
          {error}
        </div>
      )}

      {/* BOTÕES */}
      <div className="flex flex-col gap-3 w-full">

        <button
          className="w-full bg-black text-white py-3 rounded-md transition transform hover:scale-[1.02] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? 'Processando...' : 'Confirmar e pagar'}
        </button>

        <button
          className="w-full border border-gray-300 py-3 rounded-md transition transform hover:scale-[1.02] border border-gray-400"
          onClick={() => navigate("/cart")}
        >
          Voltar
        </button>

      </div>

      {/* MODAL SUCESSO */}
      {paidOrder && (
        <OrderSuccessModal
          order={paidOrder}
          paymentMethod={form.paymentMethod}
          onClose={() => setPaidOrder(null)}
        />
      )}

      {/* MODAL RECUSA */}
      {declinedOrder && (
        <PaymentDeclinedModal
          order={declinedOrder}
          onRetry={handleRetry}
          onClose={() => { setDeclinedOrder(null); navigate("/orders"); }}
          loading={loading}
        />
      )}

    </div>
  );
}

export default CheckoutPage;