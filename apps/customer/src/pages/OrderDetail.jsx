import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../api/orders";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Loading order...</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="page order-detail">
      <Link to="/orders" className="back-link">← Back to Orders</Link>
      <h1>Order #{order.id}</h1>

      <div className="status-tracker">
        {STATUS_FLOW.map((status, i) => (
          <div key={status} className={`status-step ${i <= currentStep ? "completed" : ""}`}>
            <div className="step-dot">{i <= currentStep ? "✓" : i + 1}</div>
            <span className="step-label">{status.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>

      <div className="order-section">
        <h3>Items</h3>
        {order.items.map((item, i) => (
          <div key={i} className="order-item-row">
            <span>{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-item-row total">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-section">
        <h3>Delivery Address</h3>
        <p>{order.address}</p>
      </div>
    </div>
  );
}
