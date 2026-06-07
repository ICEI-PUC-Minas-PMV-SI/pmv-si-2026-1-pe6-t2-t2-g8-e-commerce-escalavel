import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../../contexts/AuthContext";
import { orderApi } from "../../services/api";

function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await orderApi.getOrdersByUser(user.id);
        const normalized = data.map(order => ({
          id: order.id,
          status: order.status,
          transactionId: order.transactionId,
          productName: order.items?.length === 1
            ? `Pedido - item ${order.items[0].productId}`
            : `Pedido - ${order.items?.length || 0} itens`,
          total: order.items?.reduce(
            (sum, item) => sum + Number(item.unitPrice || 0) * item.quantity,
            0
          ),
          productId: order.items?.[0]?.productId,
        }));

        setOrders(normalized);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setError("Não foi possível carregar seus pedidos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // cancela mudando status localmente
  const handleCancelOrder = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: "Cancelado" }
          : order
      )
    );
  };

  const activeOrders = orders.filter(
    order => order.status.toLowerCase() !== "cancelado" && order.status.toLowerCase() !== "cancelled"
  );

  const canceledOrders = orders.filter(
    order => order.status.toLowerCase() === "cancelado" || order.status.toLowerCase() === "cancelled"
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

      {loading && (
        <p className="text-gray-500">Carregando pedidos...</p>
      )}

      {error && (
        <div className="text-red-600 text-sm border border-red-200 bg-red-50 rounded-md p-3">
          {error}
        </div>
      )}

      {/* PEDIDOS ATIVOS */}
      {activeOrders.length > 0 && (
        <div className="flex flex-col gap-5">

          {activeOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={() => order.productId && navigate(`/products/${order.productId}`)}
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
                onViewDetails={() => order.productId && navigate(`/products/${order.productId}`)}
                onCancel={handleCancelOrder}
                onDiscard={handleDiscardOrder}
              />
            ))}

          </div>

        </div>
      )}

      {/* SEM PEDIDOS */}
      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-500">
          {user ? "Você ainda não possui pedidos." : "Faça login para ver seus pedidos."}
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