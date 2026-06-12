import { useState, useEffect, useCallback, useRef } from "react";
import { getRestaurantOrders, updateRestaurantOrderStatus } from "../../api/admin";

const STATUS_FLOW = ["pending", "confirmed", "preparing"];

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set());

  const fetchOrders = useCallback(() => {
    getRestaurantOrders()
      .then((data) => {
        for (const o of data) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id);
          }
        }
        setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1];
      await updateRestaurantOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
    }
  };

  const cancelOrder = async (order) => {
    await updateRestaurantOrderStatus(order.id, "cancelled");
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "cancelled" } : o));
  };

  if (loading) {
    return (
      <div className="page admin-page">
        <div className="empty-state"><p>Loading orders...</p></div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>Orders</h1>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state"><p>No orders yet</p></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className={`admin-order-card ${order.status}`}>
              <div className="admin-order-header">
                <span className="order-status-label">{order.status.replace(/_/g, " ")}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-order-body">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Items:</strong> {order.items.map((i) => i.name).join(", ")}</p>
                <p><strong>Total:</strong> {order.total.toFixed(2)} TND</p>
              </div>
              <div className="admin-order-actions">
                {order.status === "pending" && (
                  <button className="btn-primary btn-sm" onClick={() => advanceStatus(order)}>
                    Accept ✓
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button className="btn-primary btn-sm" onClick={() => advanceStatus(order)}>
                    Mark Preparing
                  </button>
                )}
                {order.status !== "delivered" && order.status !== "cancelled" && order.status !== "preparing" && (
                  <button className="btn-secondary btn-sm btn-danger" onClick={() => cancelOrder(order)}>
                    Cancel
                  </button>
                )}
                {order.status === "preparing" && (
                  <span className="order-status-label" style={{ color: "#3498db" }}>Awaiting driver pickup</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
