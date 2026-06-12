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
          <Link to="/restaurants/new" className="btn-primary btn-sm">Add</Link>
          <Link to="/restaurants/account/new" className="btn-secondary btn-sm" style={{ marginLeft: 8 }}>+ Account</Link>
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
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <img src={r.image} alt={r.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: ".9rem" }}>{r.name}</h4>
                  <p style={{ fontSize: ".75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {r.type} · ★ {r.rating} · {r.deliveryTime}
                    {r.latitude != null && ` · 📍 ${r.latitude}, ${r.longitude}`}
                  </p>
                  {r.phone && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>📞 {r.phone}</p>}
                  {r.address && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>📍 {r.address}</p>}
                  {r.openingHours && <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>🕐 {r.openingHours}</p>}
                </div>
                <Link to={`/restaurants/edit/${r.id}`} className="btn-secondary btn-xs" style={{ marginRight: 4, flexShrink: 0 }}>Edit</Link>
                <button className="btn-secondary btn-xs btn-danger" style={{ flexShrink: 0 }} onClick={() => handleDelete(r.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
