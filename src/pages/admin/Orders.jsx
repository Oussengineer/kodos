import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../api/admin";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(() => {
    getAllOrders()
      .then((data) => setOrders(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
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
