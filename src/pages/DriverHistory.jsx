import { useState, useEffect } from "react";
import { getDeliveryHistory } from "../api/driver";

export default function DriverHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeliveryHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state"><p>Loading history...</p></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="page">
        <h2>Delivery History</h2>
        <div className="empty-state">
          <p>No deliveries completed yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page driver-history">
      <h2>Delivery History</h2>
      <p className="subtitle">{history.length} deliveries completed</p>

      <div className="driver-orders-list">
        {history.map((order) => (
          <div key={order.id} className="driver-order-card history-card">
            <div className="driver-order-top">
              <span className="driver-customer">{order.customerName}</span>
              <span className="driver-status-badge" style={{ background: "#d4edda", color: "#155724" }}>
                ✓ Delivered
              </span>
            </div>
            <p className="driver-order-items">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
            </p>
            <div className="driver-order-meta">
              <span>📍 {order.address}</span>
              <span className="driver-order-total">{order.total.toFixed(2)} TND</span>
            </div>
            <p className="driver-delivered-at">
              Delivered {new Date(order.deliveredAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
