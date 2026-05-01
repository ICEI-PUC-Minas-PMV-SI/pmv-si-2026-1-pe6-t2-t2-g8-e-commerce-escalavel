function OrderCard({ order, onViewDetails }) {
  return (
    <div style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
      <h3>Pedido #{order.id}</h3>

      <p>Status: {order.status}</p>
      <p>Total: R$ {order.total}</p>

      <button onClick={onViewDetails}>
        Ver detalhes
      </button>
    </div>
  );
}

export default OrderCard;