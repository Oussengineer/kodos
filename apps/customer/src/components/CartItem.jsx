import { useCartStore } from "../store/useCartStore";

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} className="cart-item-image" />
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        </div>
      </div>
      <button className="btn-remove" onClick={() => removeItem(item.id)}>✕</button>
    </div>
  );
}
