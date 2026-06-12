import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../api/restaurants";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("restaurant");

  useEffect(() => {
    setLoading(true);
    setError("");
    getRestaurants()
      .then(setRestaurants)
      .catch((e) => setError(e.response?.data?.error || e.message || "Failed to load"))
      .finally(() => setLoading(false));
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
          className={`chip ${activeTab === "restaurant" ? "chip-active" : ""}`}
          onClick={() => setActiveTab("restaurant")}
        >🍽️ Restaurants</button>
        <button
          className={`chip ${activeTab === "grocery" ? "chip-active" : ""}`}
          onClick={() => setActiveTab("grocery")}
        >🛒 Grocery</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : error ? (
        <div className="empty-state"><p style={{ color: "var(--danger)" }}>{error}</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No vendors available</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/${r.type === "grocery" ? "grocery" : "restaurant"}/${r.id}`}
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
                  <span>🚚 Fee at checkout</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
