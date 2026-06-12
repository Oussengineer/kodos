import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orders";
import { useAuthStore } from "../store/useAuthStore";
import ReviewPopup, { isUnreviewedDelivered } from "../components/ReviewPopup";
import { useTranslation } from "react-i18next";

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const STATUS_ICONS = {
    pending: t("orders.status_pending"),
    confirmed: t("orders.status_confirmed"),
    preparing: t("orders.status_preparing"),
    out_for_delivery: t("orders.status_out_for_delivery"),
    delivered: t("orders.status_delivered"),
  };

  const fetchOrders = useCallback(() => {
    if (isAuthenticated) getOrders().then((data) => {
      setOrders(data);
      if (!reviewOrder) {
        const delivered = data.find(isUnreviewedDelivered);
        if (delivered) setReviewOrder(delivered);
      }
    }).catch(() => {});
  }, [isAuthenticated, reviewOrder]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="page orders">
        <h1>{t("orders.title")}</h1>
        <div className="empty-state">
          <p>{t("orders.signInToSee")}</p>
          <Link to="/login" className="btn-primary">{t("orders.signIn")}</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page orders">
        <h1>{t("orders.title")}</h1>
        <div className="empty-state">
          <p>{t("orders.noOrders")}</p>
          <Link to="/" className="btn-primary">{t("orders.startOrdering")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page orders">
      <h1>{t("orders.yourOrders")}</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-status">
                {STATUS_ICONS[order.status] || "⏳"} {order.status.replace(/_/g, " ")}
              </span>
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="order-items">
              {order.items.map((i) => i.name).join(", ")}
            </p>
            <div className="order-footer">
              <span>{order.total.toFixed(2)} {t("common.currency")}</span>
              <span>{t("orders.itemsCount", { count: order.items.length })}</span>
            </div>
          </Link>
        ))}
      </div>
      {reviewOrder && (
        <ReviewPopup order={reviewOrder} onClose={() => setReviewOrder(null)} />
      )}
    </div>
  );
}
