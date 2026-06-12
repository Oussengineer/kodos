import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import { getRestaurant, getRestaurants } from "../api/restaurants";
import ProductCard from "../components/ProductCard";

export default function Grocery() {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getProducts({ type: "grocery" }).then(setProducts).catch(() => {});
    getRestaurant(0).then((r) => {
      if (r && r.id) { setStore(r); return; }
      throw new Error("Grocery store not found");
    }).catch((e) => {
      getRestaurants().then((restaurants) => {
        const grocery = restaurants.find((r) => r.type === "grocery");
        if (grocery) { setStore(grocery); }
        else { setError("Grocery store not found"); }
      }).catch(() => setError("Failed to load store"));
    });
  }, []);

  if (error) return <div className="page"><Link to="/" className="back-link">← Back</Link><div className="empty-state"><p style={{ color: "var(--danger)" }}>{error}</p></div></div>;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back</Link>
      {store && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <img src={store.image} alt={store.name} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <h1 style={{ fontSize: "1.3rem" }}>{store.name}</h1>
            <p style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{store.description}</p>
            <div style={{ display: "flex", gap: 8, fontSize: ".75rem", color: "var(--text-muted)", marginTop: 4 }}>
              <span>🕐 {store.deliveryTime}</span>
              <span>🚚 Fee at checkout</span>
            </div>
            {store.phone && <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 4 }}>📞 {store.phone}</p>}
            {store.address && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>📍 {store.address}</p>}
            {store.openingHours && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>🕐 {store.openingHours}</p>}
          </div>
        </div>
      )}
      <div className="products-grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
