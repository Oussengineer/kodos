import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../api/admin";
import { requestNotifyPermission, sendNotification } from "../../utils/notify";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const seenIds = useRef(new Set());

  const fetchOrders = useCallback(() => {
    getAllOrders()
      .then((data) => {
        for (const o of data) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id);
            sendNotification("New Order!", `Order #${o.id} — ${o.customerName} — ${o.total.toFixed(2)} TND`);
          }
        }
        setOrders(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    requestNotifyPermission();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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
                <p><strong>Total:</strong> {order.total.toFixed(2)} TND</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
