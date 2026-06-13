import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDeliveryHistory } from "../api/driver";

export default function DriverHistory() {
  const { t } = useTranslation();
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
        <div className="empty-state"><p>{t("driver.history.loading")}</p></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="page">
        <h2>{t("driver.history.title")}</h2>
        <div className="empty-state">
          <p>{t("driver.history.noDeliveries")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page driver-history">
      <h2>{t("driver.history.title")}</h2>
      <p className="subtitle">{t("driver.history.completed", { count: history.length })}</p>

      <div className="driver-orders-list">
        {history.map((order) => (
          <div key={order.id} className="driver-order-card history-card">
            <div className="driver-order-top">
              <span className="driver-customer">{order.customerName}</span>
              <span className="driver-status-badge" style={{ background: "#d4edda", color: "#155724" }}>
                {t("driver.history.delivered")}
              </span>
            </div>
            <p className="driver-order-items">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
            </p>
            <div className="driver-order-meta">
              <span>📍 {order.address}</span>
              <span className="driver-order-total">{order.total.toFixed(2)} TND</span>
            </div>
            {order.customerPhone && <p className="driver-order-phone">📞 {order.customerPhone}</p>}
            <p className="driver-delivered-at">
              {t("driver.history.deliveredOn", { date: new Date(order.deliveredAt).toLocaleString() })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
