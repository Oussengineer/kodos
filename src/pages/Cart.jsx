import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { placeOrder } from "../api/orders";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { items, getTotal, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (!address.trim()) return alert("Please enter a delivery address");
    setPlacing(true);
    try {
      await placeOrder({ items, address, total: getTotal() });
      clearCart();
      navigate("/orders");
    } catch {
      alert("Failed to place order. Is the server running?");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page cart">
        <h1>Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate("/menu")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <input
          type="text"
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="address-input"
        />
        <button className="btn-primary" onClick={handleCheckout} disabled={placing}>
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
