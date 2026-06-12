import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStats } from "../../api/admin";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="page admin-page">
        <div className="empty-state"><p>{t("admin.dashboard.loading")}</p></div>
      </div>
    );
  }

  const cards = [
    { label: t("admin.dashboard.totalOrders"), value: stats.totalOrders, icon: "📋", color: "#ff6b35" },
    { label: t("admin.dashboard.revenue"), value: `${stats.totalRevenue.toFixed(2)} ${t("common.currency")}`, icon: "💰", color: "#2ecc71" },
    { label: t("admin.dashboard.pending"), value: stats.pendingOrders, icon: "⏳", color: "#f39c12" },
    { label: t("admin.dashboard.preparing"), value: stats.preparingOrders, icon: "👨‍🍳", color: "#3498db" },
    { label: t("admin.dashboard.outForDelivery"), value: stats.outForDelivery, icon: "🚚", color: "#9b59b6" },
    { label: t("admin.dashboard.delivered"), value: stats.deliveredOrders, icon: "📦", color: "#2ecc71" },
    { label: t("admin.dashboard.products"), value: stats.totalProducts, icon: "🍽️", color: "#e74c3c" },
    { label: t("admin.dashboard.vendors"), value: stats.totalRestaurants, icon: "🏪", color: "#1abc9c" },
  ];

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>{t("admin.dashboard.title")}</h1>
        <p className="subtitle">{t("admin.dashboard.welcome", { name: user?.name })}</p>
      </div>

      <div className="admin-nav-cards">
        <Link to="/orders" className="admin-nav-card">
          <span className="anc-icon">📋</span>
          <span>{t("admin.dashboard.manageOrders")}</span>
        </Link>
        <Link to="/products" className="admin-nav-card">
          <span className="anc-icon">🍽️</span>
          <span>{t("admin.dashboard.manageProducts")}</span>
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
