import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../api/restaurants";

const TYPE_ICONS = { restaurant: "🍽️", grocery: "🛒" };

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState("restaurants");

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(() => {});
  }, []);

  const filtered = restaurants.filter((r) => r.type === activeTab);

  return (
    <div className="page home">
      <header className="page-header">
        <h1>Kodos</h1>
        <p className="subtitle">Fresh food, delivered fast</p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`chip ${activeTab === "restaurants" ? "chip-active" : ""}`}
          onClick={() => setActiveTab("restaurants")}
        >🍽️ Restaurants</button>
        <button
          className={`chip ${activeTab === "grocery" ? "chip-active" : ""}`}
          onClick={() => setActiveTab("grocery")}
        >🛒 Grocery</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/${activeTab === "grocery" ? "grocery" : "restaurant"}/${r.id}`}
              style={{
                display: "flex", gap: 12, background: "var(--surface)", borderRadius: "var(--radius)",
                boxShadow: "var(--shadow)", padding: 12, textDecoration: "none", color: "inherit",
              }}
            >
              <img src={r.image} alt={r.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} loading="lazy" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: ".95rem", fontWeight: 700 }}>{r.name}</h3>
                  <span style={{ fontSize: ".8rem", color: "#f39c12" }}>★ {r.rating}</span>
                </div>
                <p style={{ fontSize: ".8rem", color: "var(--text-muted)", margin: "4px 0" }}>{r.description}</p>
                <div style={{ display: "flex", gap: 8, fontSize: ".75rem", color: "var(--text-muted)" }}>
                  <span>🕐 {r.deliveryTime}</span>
                  <span>🚚 ${r.deliveryFee.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
