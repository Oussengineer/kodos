import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAdminProducts, deleteProduct, getAdminRestaurants } from "../../api/admin";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    getAdminProducts().then(setProducts).catch(() => {});
    getAdminRestaurants().then(setRestaurants).catch(() => {});
  }, []);

  const vendorName = (id) => restaurants.find((r) => r.id === id)?.name || "Unknown";

  const handleDelete = async (id) => {
    if (!confirm(t("admin.products.deleteConfirm"))) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/" className="back-link">{t(isAdmin ? "admin.products.backDashboard" : "admin.products.backOrders")}</Link>
        <div className="admin-header-row">
          <h1>{t("admin.products.title")}</h1>
          {isAdmin && <Link to="/products/new" className="btn-primary btn-sm">{t("admin.products.add")}</Link>}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state"><p>{t("admin.products.noProducts")}</p></div>
      ) : (
        <div className="admin-products-list">
          {products.map((p) => (
            <div key={p.id} className="admin-product-card">
              <img src={p.image} alt={p.name} className="admin-product-img" />
              <div className="admin-product-info">
                <h4>{p.name}</h4>
                <p className="admin-product-cat">{vendorName(p.restaurantId)} · {p.type} · {p.category}</p>
                <span className="product-price">{p.price.toFixed(2)} {t("common.currency")}</span>
              </div>
              {isAdmin && (
                <div className="admin-product-actions">
                  <Link to={`/products/edit/${p.id}`} className="btn-secondary btn-xs">{t("admin.products.edit")}</Link>
                  <button className="btn-secondary btn-xs btn-danger" onClick={() => handleDelete(p.id)}>{t("admin.products.del")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
