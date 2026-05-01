function OrderSummary({ items }) {
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Resumo</h2>
      <p>Total: R$ {total}</p>
    </div>
  );
}

export default OrderSummary;