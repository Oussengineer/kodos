import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../../api/admin";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="page admin-page">
        <div className="empty-state"><p>Loading dashboard...</p></div>
      </div>
    );
  }

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: "📋", color: "#ff6b35" },
    { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "#2ecc71" },
    { label: "Pending", value: stats.pendingOrders, icon: "⏳", color: "#f39c12" },
    { label: "Preparing", value: stats.preparingOrders, icon: "👨‍🍳", color: "#3498db" },
    { label: "Out for Delivery", value: stats.outForDelivery, icon: "🚚", color: "#9b59b6" },
    { label: "Delivered", value: stats.deliveredOrders, icon: "📦", color: "#2ecc71" },
    { label: "Products", value: stats.totalProducts, icon: "🍽️", color: "#e74c3c" },
  ];

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Welcome back, {user?.name}</p>
      </div>

      <div className="admin-nav-cards">
        <Link to="/orders" className="admin-nav-card">
          <span className="anc-icon">📋</span>
          <span>Manage Orders</span>
        </Link>
        <Link to="/products" className="admin-nav-card">
          <span className="anc-icon">🍽️</span>
          <span>Manage Products</span>
        </Link>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card" style={{ borderTopColor: c.color }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
