import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import { getRestaurant } from "../api/restaurants";
import ProductCard from "../components/ProductCard";

export default function Grocery() {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    getProducts({ type: "grocery" }).then(setProducts).catch(() => {});
    getRestaurant(6).then(setStore).catch(() => {});
  }, []);

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
              <span>🚚 ${store.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      <div className="products-grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
