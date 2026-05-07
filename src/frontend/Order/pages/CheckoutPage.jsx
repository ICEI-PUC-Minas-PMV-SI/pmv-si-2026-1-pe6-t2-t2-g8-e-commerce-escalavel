import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../services/Api";
import OrderSuccessModal from "../components/modals/OrderSuccessModal";

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

  //const handleSubmit = async () => {
  //  try {
  //    const orderData = {
  //      items: cartItems,
  //      address: form.address,
  //      city: form.city,
  //      paymentMethod: form.paymentMethod
  //    };
//
  //    const response = await orderApi.createOrder(orderData);
  //    setCreatedOrder(response);
//
  //  } catch (error) {
  //    console.error("Erro ao criar pedido:", error);
  //    alert("Erro ao finalizar pedido");
  //  }
  //};

  const handleSubmit = () => {
  navigate("/orders");
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
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="email"
    placeholder="Email"
    type="email"
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="cpf"
    placeholder="CPF"
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="phone"
    placeholder="Telefone"
    onChange={handleChange}
  />

</div>

{/* ENDEREÇO */}
<div className="flex flex-col gap-4">

  <h2 className="text-lg font-medium">Endereço</h2>

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="cep"
    placeholder="CEP"
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="city"
    placeholder="Cidade"
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="neighborhood"
    placeholder="Bairro"
    onChange={handleChange}
  />

  <input className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
    name="street"
    placeholder="Rua"
    onChange={handleChange}
  />

  <div className="flex gap-3">

    <input className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
      name="number"
      placeholder="Número"
      onChange={handleChange}
    />

    <input className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
      name="complement"
      placeholder="Complemento"
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
            onClick={() => setForm({ ...form, paymentMethod: "debt_card" })}
            className={`border rounded-md p-3 text-center cursor-pointer transition transition transform hover:scale-[1.02] ${
              form.paymentMethod === "debt_card"
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

        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span>{item.name} x{item.quantity}</span>
            <span className="text-black font-medium">
              R$ {item.price * item.quantity}
            </span>
          </div>
        ))}

        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">Total</span>
          <strong className="text-lg">R$ {total}</strong>
        </div>
      </div>

      {/* BOTÕES */}
      <div className="flex flex-col gap-3 w-full">

        <button
          className="w-full bg-black text-white py-3 rounded-md transition transform hover:scale-[1.02]"
          onClick={handleSubmit}
        >
          Confirmar pedido
        </button>

        <button
          className="w-full border border-gray-300 py-3 rounded-md transition transform hover:scale-[1.02] border border-gray-400"
          onClick={() => navigate("/cart")}
        >
          Voltar
        </button>

      </div>

      {/* MODAL */}
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