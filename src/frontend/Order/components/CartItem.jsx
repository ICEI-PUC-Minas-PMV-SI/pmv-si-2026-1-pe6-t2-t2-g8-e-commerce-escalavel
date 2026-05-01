function CartItem({ item }) {
  return (
    <div style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
      <h3>{item.name}</h3>
      <p>Preço: R$ {item.price}</p>
      <p>Quantidade: {item.quantity}</p>
    </div>
  );
}

export default CartItem;