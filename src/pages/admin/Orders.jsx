import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllOrders, updateOrderStatus } from "../../api/admin";
import { requestNotifyPermission, sendNotification } from "../../utils/notify";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

export default function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const ADMIN_ACTIONS = {
    pending: { next: "confirmed", label: t("admin.orders.confirmOrder"), color: "#2ecc71" },
    confirmed: { next: "preparing", label: t("admin.orders.markPreparing"), color: "#3498db" },
    preparing: null,
    out_for_delivery: null,
    delivered: null,
    cancelled: null,
  };
  const seenIds = useRef(new Set());
  const isFirstFetch = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      if (isFirstFetch.current) {
        isFirstFetch.current = false;
        for (const o of data) seenIds.current.add(o.id);
      } else {
        for (const o of data) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id);
            sendNotification(t("admin.orders.newOrder"), `Order #${o.id} — ${o.customerName} — ${o.total.toFixed(2)} ${t("common.currency")}`);
          }
        }
      }
      setOrders(data);
      setUpdating(null);
    } catch {}
  }, []);

  useEffect(() => {
    requestNotifyPermission().then(fetchOrders);
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
        <Link to="/" className="back-link">{t("admin.orders.backDashboard")}</Link>
        <h1>{t("admin.orders.title")}</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><p>{t("admin.orders.noOrders")}</p></div>
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
                  <p><strong>{t("admin.orders.customer")}</strong> {order.customerName}</p>
                  {order.customerPhone && <p><strong>{t("admin.orders.phone")}</strong> {order.customerPhone}</p>}
                  <p><strong>{t("admin.orders.address")}</strong> {order.address}</p>
                  <p><strong>{t("admin.orders.items")}</strong> {order.items.map((i) => i.name).join(", ")}</p>
                  <p><strong>{t("admin.orders.total")}</strong> {order.total.toFixed(2)} {t("common.currency")}</p>
                </div>
                <div className="admin-order-actions">
                  {action && (
                    <button
                      className="btn-primary"
                      style={{ background: action.color }}
                      onClick={() => handleStatus(order.id, action.next)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? t("admin.orders.updating") : action.label}
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "preparing" && (
                    <button
                      className="btn-secondary"
                      style={{ background: "#e74c3c", color: "#fff" }}
                      onClick={() => handleStatus(order.id, "cancelled")}
                      disabled={updating === order.id}
                    >
                      {t("admin.orders.cancel")}
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
