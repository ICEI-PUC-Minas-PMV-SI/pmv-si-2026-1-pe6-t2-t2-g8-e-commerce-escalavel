import { useNavigate, Link } from "react-router-dom";
import "./components-styles/CartItem.css";
import { FiTrash2 } from "react-icons/fi";

function CartItem({ item, onRemove, onUpdateQuantity, onToggleSelect }) {
  const navigate = useNavigate();
  const subtotal = item.price * item.quantity;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="cart-item">

      {/* imagem clicável */}
      <div className="cart-item-media">
        <Link to={`/products/${item.id}`}>
          <div className="cart-item-image" />
        </Link>
      </div>

      {/* info */}
      <div className="cart-item-info">

        {/* nome clicável */}
        <Link
          to={`/products/${item.id}`}
          className="cart-item-title-link"
        >
          <h3 className="cart-item-title">
            {item.name}
          </h3>
        </Link>



        <div className="cart-item-quantity">

          <button
            className="qty-btn"
            onClick={() =>
              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
            }
          >
            -
          </button>

          <span className="qty-value">{item.quantity}</span>

          <button
            className="qty-btn"
            onClick={() =>
              onUpdateQuantity(item.id, item.quantity + 1)
            }
          >
            +
          </button>

        </div>

        <p className="cart-item-subtotal">
          Subtotal: R$ {subtotal}
        </p>
      </div>

      {/* ações */}
      <div className="cart-item-actions">

        <div className="cart-item-select">
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => onToggleSelect(item.id)}
            className="cart-item-checkbox"
          />
        </div>

        <button
          className="trash-button"
          onClick={() => onRemove(item.id)}
          aria-label="Remover item"
        >
          <FiTrash2 />
        </button>

      </div>

    </div>
  );
}

export default CartItem;