import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { orderApi } from "../../services/Api";
import OrderCard from "../components/OrderCard";
import OrderDetailsModal from "../components/modals/OrderDetailsModal";

function OrdersPage() {

  // 1.STATES
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const location = useLocation();
  const newOrder = location.state?.newOrder;

  // 2.useEffect (buscar pedidos)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = 1; // temporário
        const data = await orderApi.getOrdersByUser(userId);

        if (newOrder) {
          setOrders([newOrder, ...data]);
        } else {
          setOrders(data);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
  }, []);

  // 3.RETURN (HTML + JSX)
  return (
    <div>
      <h1>Meus Pedidos</h1>

      {orders.length === 0 && <p>Nenhum pedido encontrado</p>}

      {/* 4. MAP (lista de pedidos) */}
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onViewDetails={() => setSelectedOrder(order)}
        />
      ))}

      {/* 5. MODAL (fica no final do return) */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default OrdersPage;