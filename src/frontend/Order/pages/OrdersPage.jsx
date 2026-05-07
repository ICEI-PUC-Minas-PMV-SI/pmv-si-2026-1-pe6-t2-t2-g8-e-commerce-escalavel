import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderCard";

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    {
      id: 10234,
      productName: "Camiseta Essential",
      status: "Entregue",
      total: 220,
      date: "05/05/2026"
    },
    {
      id: 10235,
      productName: "Calça Jeans",
      status: "Em transporte",
      total: 150,
      date: "06/05/2026"
    },
    {
      id: 10236,
      productName: "Tênis Runner",
      status: "Em transporte",
      total: 89,
      date: "06/05/2026"
    }
  ]);

  // cancela mudando status
  const handleCancelOrder = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: "Cancelado" }
          : order
      )
    );
  };

  // separação lógica
  const activeOrders = orders.filter(
    order => order.status !== "Cancelado"
  );

  const canceledOrders = orders.filter(
    order => order.status === "Cancelado"
  );

  const handleDiscardOrder = (orderId) => {
    setOrders(prev =>
      prev.filter(order => order.id !== orderId)
    );
  };
  

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-10">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold">
        Meus pedidos
      </h1>

      {/* PEDIDOS ATIVOS */}
      {activeOrders.length > 0 && (
        <div className="flex flex-col gap-5">

          {activeOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancelOrder}
              onDiscard={handleDiscardOrder}
            />
          ))}

        </div>
      )}

      {/* PEDIDOS CANCELADOS */}
      {canceledOrders.length > 0 && (
        <div className="flex flex-col gap-5 mt-8">

          <h2 className="text-xl font-semibold text-gray-700">
            Pedidos cancelados
          </h2>

          <div className="flex flex-col gap-5 opacity-70">

            {canceledOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancelOrder}
                onDiscard={handleDiscardOrder}
              />
            ))}

          </div>

        </div>
      )}

      {/* SEM PEDIDOS */}
      {orders.length === 0 && (
        <p className="text-gray-500">
          Você ainda não possui pedidos.
        </p>
      )}

      {/* BOTÃO VOLTAR */}
      <div className="flex justify-center mt-10">

        <button
          onClick={() => navigate("/")}
          className="px-10 py-3 bg-black text-white rounded-md transition transform hover:scale-[1.02]"
        >
          Voltar para página inicial
        </button>

      </div>

    </div>
  );
}

export default OrdersPage;