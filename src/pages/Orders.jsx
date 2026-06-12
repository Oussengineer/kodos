import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orders";
import { useAuthStore } from "../store/useAuthStore";
import ReviewPopup, { isUnreviewedDelivered } from "../components/ReviewPopup";

const STATUS_ICONS = {
  pending: "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  out_for_delivery: "🚚",
  delivered: "📦",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const fetchOrders = useCallback(() => {
    if (isAuthenticated) getOrders().then((data) => {
      setOrders(data);
      if (!reviewOrder) {
        const delivered = data.find(isUnreviewedDelivered);
        if (delivered) setReviewOrder(delivered);
      }
    }).catch(() => {});
  }, [isAuthenticated, reviewOrder]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="page orders">
        <h1>Orders</h1>
        <div className="empty-state">
          <p>Sign in to see your orders</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page orders">
        <h1>Orders</h1>
        <div className="empty-state">
          <p>No orders yet</p>
          <Link to="/" className="btn-primary">Start Ordering</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page orders">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-status">
                {STATUS_ICONS[order.status] || "⏳"} {order.status.replace(/_/g, " ")}
              </span>
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="order-items">
              {order.items.map((i) => i.name).join(", ")}
            </p>
            <div className="order-footer">
              <span>{order.total.toFixed(2)} TND</span>
              <span>{order.items.length} items</span>
            </div>
          </Link>
        ))}
      </div>
      {reviewOrder && (
        <ReviewPopup order={reviewOrder} onClose={() => setReviewOrder(null)} />
      )}
    </div>
  );
}
