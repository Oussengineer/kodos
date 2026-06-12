import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurant } from "../api/restaurants";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

export default function RestaurantDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getRestaurant(id).then(setRestaurant).catch((e) => setError(e.response?.data?.error || t("restaurantDetail.failedToLoad")));
    getProducts({ restaurantId: id }).then(setProducts).catch(() => {});
  }, [id]);

  if (error) return <div className="page"><div className="empty-state"><p style={{ color: "var(--danger)" }}>{error}</p></div></div>;
  if (!restaurant) return <div className="page"><div className="empty-state"><p>{t("restaurantDetail.loading")}</p></div></div>;

  return (
    <div className="page">
      <Link to="/" className="back-link">{t("restaurantDetail.back")}</Link>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <img src={restaurant.image} alt={restaurant.name} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
        <div>
          <h1 style={{ fontSize: "1.3rem" }}>{restaurant.name}</h1>
          <p style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{restaurant.description}</p>
          <div style={{ display: "flex", gap: 8, fontSize: ".75rem", color: "var(--text-muted)", marginTop: 4 }}>
            <span>★ {restaurant.rating}</span>
            <span>🕐 {restaurant.deliveryTime}</span>
            <span>{t("restaurantDetail.deliveryFee")}</span>
          </div>
          {restaurant.phone && <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 4 }}>📞 {restaurant.phone}</p>}
          {restaurant.address && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>📍 {restaurant.address}</p>}
          {restaurant.openingHours && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>🕐 {restaurant.openingHours}</p>}
        </div>
      </div>
      <div className="products-grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
