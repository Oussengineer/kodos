import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminRestaurants, deleteRestaurant } from "../../api/admin";

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getAdminRestaurants().then(setRestaurants).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this restaurant?")) return;
    await deleteRestaurant(id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/" className="back-link">← Dashboard</Link>
        <div className="admin-header-row">
          <h1>Vendors</h1>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="empty-state"><p>No vendors yet</p></div>
      ) : (
        <div className="admin-products-list">
          {restaurants.map((r) => (
            <div key={r.id} style={{
              background: "var(--surface)", borderRadius: "var(--radius)",
              boxShadow: "var(--shadow)", padding: 12, marginBottom: 8,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={r.image} alt={r.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: ".9rem" }}>{r.name}</h4>
                  <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                    {r.type} · ★ {r.rating} · {r.deliveryTime} · ${r.deliveryFee.toFixed(2)}
                  </p>
                </div>
                <button className="btn-secondary btn-xs btn-danger" onClick={() => handleDelete(r.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
