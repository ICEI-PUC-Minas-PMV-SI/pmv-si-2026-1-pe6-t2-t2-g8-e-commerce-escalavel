import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderCard";

function OrdersPage() {

  const navigate = useNavigate();

  const [orders] = useState([
    {
      id: 10234,
      status: "Entregue",
      total: 220,
      date: "05/05/2026"
    },
    {
      id: 10235,
      status: "Em transporte",
      total: 150,
      date: "06/05/2026"
    },
    {
      id: 10236,
      status: "Processando",
      total: 89,
      date: "06/05/2026"
    }
  ]);

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">

      <h1 className="text-3xl font-bold">
        Meus pedidos
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">
          Você ainda não possui pedidos.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
            />
          ))}
        </div>
      )}

    <div className="flex justify-center mt-10">
  <button
    onClick={() => navigate("/")}
    className="px-10 py-3 bg-black text-white rounded-md transition transform hover:scale-[1.02]"
  >
    Voltar para pagina inicial
  </button>
</div>
    </div>
  );
}

export default OrdersPage;