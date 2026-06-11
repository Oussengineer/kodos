import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getActiveDeliveries, updateDeliveryStatus } from "../api/driver";
import { useDriverStore } from "../store/useDriverStore";

export default function DriverActiveDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const setActiveDeliveries = useDriverStore((s) => s.setActiveDeliveries);

  const fetchActive = useCallback(() => {
    getActiveDeliveries()
      .then((data) => {
        setDeliveries(data);
        setActiveDeliveries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setActiveDeliveries]);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  const handleDelivered = async (id) => {
    setUpdating(id);
    try {
      await updateDeliveryStatus(id, "delivered");
      fetchActive();
    } catch {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state"><p>Loading active deliveries...</p></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="page">
        <h2>Active Deliveries</h2>
        <div className="empty-state">
          <p>No active deliveries</p>
          <Link to="/driver" className="btn-primary">Find Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page driver-active">
      <h2>Active Deliveries</h2>
      <p className="subtitle">{deliveries.length} delivery in progress</p>

      <div className="driver-orders-list">
        {deliveries.map((order) => (
          <div key={order.id} className="driver-order-card active-card">
            <div className="driver-order-top">
              <span className="driver-customer">{order.customerName}</span>
              <span className="driver-status-badge" style={{ background: "#cce5ff", color: "#004085" }}>
                Out for Delivery
              </span>
            </div>

            <p className="driver-order-items">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
            </p>

            <div className="driver-order-meta">
              <span>📍 {order.address}</span>
              <span className="driver-order-total">${order.total.toFixed(2)}</span>
            </div>

            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="driver-call-btn">
                📞 Call {order.customerName}
              </a>
            )}

            <button
              className="btn-primary"
              style={{ background: "var(--success)" }}
              onClick={() => handleDelivered(order.id)}
              disabled={updating === order.id}
            >
              {updating === order.id ? "Updating..." : "✓ Mark as Delivered"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
