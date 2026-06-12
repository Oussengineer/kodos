import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/admin";

const STATUS_FLOW = ["pending", "confirmed", "preparing"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(() => {
    getAllOrders().then(setOrders).catch(() => {});
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < STATUS_FLOW.length - 1) {
      const next = STATUS_FLOW[idx + 1];
      await updateOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
    }
  };

  const cancelStatus = async (order) => {
    await updateOrderStatus(order.id, "cancelled");
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "cancelled" } : o));
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/" className="back-link">← Dashboard</Link>
        <h1>All Orders</h1>
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
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              </div>
              <div className="admin-order-actions">
                {order.status !== "delivered" && order.status !== "cancelled" && (
                  <button className="btn-primary btn-sm" onClick={() => advanceStatus(order)}>
                    Advance → {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]?.replace(/_/g, " ")}
                  </button>
                )}
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <button className="btn-secondary btn-sm btn-danger" onClick={() => cancelStatus(order)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
