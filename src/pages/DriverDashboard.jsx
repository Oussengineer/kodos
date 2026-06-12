import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAvailableOrders, acceptOrder } from "../api/driver";
import { useDriverStore } from "../store/useDriverStore";
import { requestNotifyPermission, sendNotification } from "../utils/notify";

const STATUS_COLORS = {
  preparing: { bg: "#fff3cd", color: "#856404", label: "Preparing" },
  out_for_delivery: { bg: "#cce5ff", color: "#004085", label: "Ready for Pickup" },
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const setActiveDeliveries = useDriverStore((s) => s.setActiveDeliveries);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const seenIds = useRef(new Set());

  const fetchOrders = useCallback(() => {
    getAvailableOrders()
      .then((data) => {
        for (const o of data) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id);
            sendNotification("Delivery Available!", `Order #${o.id} — ${o.total.toFixed(2)} TND`);
          }
        }
        setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    requestNotifyPermission();
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      await acceptOrder(id);
      setActiveDeliveries([]);
      navigate("/active");
    } catch {
      setAccepting(null);
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state"><p>{t("driver.dashboard.loading")}</p></div>
      </div>
    );
  }

  return (
    <div className="page driver-dashboard">
      <h2>{t("driver.dashboard.title")}</h2>
      <p className="subtitle">{t("driver.dashboard.subtitle")}</p>

      {orders.length === 0 && (
        <div className="empty-state">
          <p>{t("driver.dashboard.noOrders")}</p>
        </div>
      )}

      <div className="driver-orders-list">
        {orders.map((order) => {
          const status = STATUS_COLORS[order.status] || STATUS_COLORS.preparing;
          return (
            <div key={order.id} className="driver-order-card">
              <div className="driver-order-top">
                <span className="driver-customer">{order.customerName}</span>
                <span
                  className="driver-status-badge"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
              </div>
              <p className="driver-order-items">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
              <div className="driver-order-meta">
                <span>📍 {order.address}</span>
                <span className="driver-order-total">{order.total.toFixed(2)} TND</span>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleAccept(order.id)}
                disabled={accepting === order.id}
              >
                {accepting === order.id ? t("driver.dashboard.accepting") : t("driver.dashboard.accept")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
