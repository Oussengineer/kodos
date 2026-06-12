import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/admin";
import { requestNotifyPermission, sendNotification } from "../../utils/notify";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

const ADMIN_ACTIONS = {
  pending: { next: "confirmed", label: "Confirm Order", color: "#2ecc71" },
  confirmed: { next: "preparing", label: "Mark Preparing", color: "#3498db" },
  preparing: null,
  out_for_delivery: null,
  delivered: null,
  cancelled: null,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const seenIds = useRef(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      for (const o of data) {
        if (!seenIds.current.has(o.id)) {
          seenIds.current.add(o.id);
          sendNotification("New Order!", `Order #${o.id} — ${o.customerName} — ${o.total.toFixed(2)} TND`);
        }
      }
      setOrders(data);
      setUpdating(null);
    } catch {}
  }, []);

  useEffect(() => {
    requestNotifyPermission();
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      await fetchOrders();
    } catch {
      setUpdating(null);
    }
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
          {orders.map((order) => {
            const action = ADMIN_ACTIONS[order.status];
            return (
              <div key={order.id} className={`admin-order-card ${order.status}`}>
                <div className="admin-order-header">
                  <span className={`order-status-label status-${order.status}`}>{order.status.replace(/_/g, " ")}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="admin-order-body">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                  <p><strong>Items:</strong> {order.items.map((i) => i.name).join(", ")}</p>
                  <p><strong>Total:</strong> {order.total.toFixed(2)} TND</p>
                </div>
                <div className="admin-order-actions">
                  {action && (
                    <button
                      className="btn-primary"
                      style={{ background: action.color }}
                      onClick={() => handleStatus(order.id, action.next)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? "Updating..." : action.label}
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "preparing" && (
                    <button
                      className="btn-secondary"
                      style={{ background: "#e74c3c", color: "#fff" }}
                      onClick={() => handleStatus(order.id, "cancelled")}
                      disabled={updating === order.id}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
