import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder, getDriverLocation, postReview } from "../api/orders";
import { useAuthStore } from "../store/useAuthStore";
import "../utils/leafletIcons";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [reviewMsg, setReviewMsg] = useState("");
  const user = useAuthStore((s) => s.user);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    const fetchOrder = () => getOrder(id).then(setOrder).catch(() => setOrder(null));
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // driver tracking polling — 1s for real-time
  useEffect(() => {
    if (!order || !["out_for_delivery", "delivered"].includes(order.status)) {
      setDriverPos(null);
      return;
    }
    const fetchLoc = () => {
      getDriverLocation(order.id).then((loc) => {
        if (loc) setDriverPos(loc);
      }).catch(() => {});
    };
    fetchLoc();
    const interval = setInterval(fetchLoc, 5000);
    return () => clearInterval(interval);
  }, [order]);

  // render leaflet map for driver tracking + route
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      const center = driverPos ? [driverPos.lat, driverPos.lng] : [0, 0];
      const map = L.map(mapRef.current).setView(center, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapInstanceRef.current = map;
    }
    const map = mapInstanceRef.current;

    // driver marker
    if (driverPos) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
      } else {
        driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], {
          icon: L.divIcon({
            className: "",
            html: '<div style="background:#3498db;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.3)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map).bindPopup("Driver");
      }
    }

    // destination marker (delivery address)
    if (order?.latitude != null && order?.longitude != null) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([order.latitude, order.longitude]);
      } else {
        destMarkerRef.current = L.marker([order.latitude, order.longitude], {
          icon: L.divIcon({
            className: "",
            html: '<div style="background:#e74c3c;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.3)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map).bindPopup("Delivery");
      }
    }

    // fit bounds to show both
    if (driverPos && order?.latitude != null && order?.longitude != null) {
      map.fitBounds([
        [driverPos.lat, driverPos.lng],
        [order.latitude, order.longitude],
      ], { padding: [50, 50] });
    } else if (driverPos) {
      map.setView([driverPos.lat, driverPos.lng], 14);
    } else if (order?.latitude != null && order?.longitude != null) {
      map.setView([order.latitude, order.longitude], 14);
    }

    // fetch OSRM route — debounced
    if (driverPos && order?.latitude != null && order?.longitude != null) {
      const timer = setTimeout(() => {
        const url = `https://router.project-osrm.org/route/v1/driving/${driverPos.lng},${driverPos.lat};${order.longitude},${order.latitude}?geometries=geojson&overview=full`;
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            if (!data.routes?.[0]) return;
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            setRouteInfo({ distance: route.distance, duration: route.duration });
            if (routeLineRef.current) map.removeLayer(routeLineRef.current);
            routeLineRef.current = L.polyline(coords, {
              color: "#3498db", weight: 4, opacity: 0.7,
            }).addTo(map);
          })
          .catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [driverPos, order]);

  const handleReview = async (productId) => {
    const key = productId;
    try {
      await postReview(productId, { rating: ratings[key] || 5, comment: comments[key] || "", userName: user?.name || "Customer" });
      setReviewMsg("Review submitted! Thank you.");
    } catch {
      setReviewMsg("Failed to submit review");
    }
  };

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Loading order...</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="page order-detail">
      <Link to="/orders" className="back-link">← Back to Orders</Link>
      <h1>Order #{order.id}</h1>

      <div className="status-tracker">
        {STATUS_FLOW.map((status, i) => (
          <div key={status} className={`status-step ${i <= currentStep ? "completed" : ""}`}>
            <div className="step-dot">{i <= currentStep ? "✓" : i + 1}</div>
            <span className="step-label">{status.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>

      {/* driver info */}
      {order.driverId && ["out_for_delivery", "delivered"].includes(order.status) && (
        <div className="order-section">
          <h3>Your Driver</h3>
          <p><strong>{order.driverName || "Driver"}</strong></p>
          {order.driverPhone && (
            <a href={`tel:${order.driverPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)", fontWeight: 600, textDecoration: "none", marginTop: 4 }}>
              📞 Call {order.driverName || "Driver"} — {order.driverPhone}
            </a>
          )}
          <h3 style={{ marginTop: 12 }}>{driverPos ? "Driver Location" : "Driver is on the way..."}</h3>
          {routeInfo && (
            <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: 6 }}>
              🗺️ {(routeInfo.distance / 1000).toFixed(1)} km · {Math.round(routeInfo.duration / 60)} min away
            </p>
          )}
          <div ref={mapRef} style={{ height: 220, borderRadius: 8, zIndex: 1 }} />
        </div>
      )}

      <div className="order-section">
        <h3>Items</h3>
        {order.items.map((item, i) => (
          <div key={i} className="order-item-row">
            <span>{item.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toFixed(2)} TND</span>
          </div>
        ))}
        <div className="order-item-row total">
          <span>Total</span>
          <span>{order.total.toFixed(2)} TND</span>
        </div>
      </div>

      <div className="order-section">
        <h3>Delivery Address</h3>
        <p>{order.address}</p>
        {order.latitude && order.longitude && (
          <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 4 }}>
            {order.latitude.toFixed(5)}, {order.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* review section */}
      {order.status === "delivered" && (
        <div className="order-section">
          <h3>Rate Your Order</h3>
          {reviewMsg && <p style={{ color: "var(--success)", marginBottom: 8 }}>{reviewMsg}</p>}
          {order.items.map((item) => {
            const key = item.productId || item.id;
            return (
              <div key={key} style={{ marginBottom: 12, padding: 8, background: "var(--bg)", borderRadius: 8 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatings((prev) => ({ ...prev, [key]: star }))}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "1.3rem", color: star <= (ratings[key] || 5) ? "#f39c12" : "#ddd",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Write a comment (optional)"
                  value={comments[key] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    border: "1px solid var(--border)", borderRadius: 6,
                    padding: "6px 10px", width: "100%", fontSize: ".85rem",
                    marginBottom: 6, boxSizing: "border-box",
                  }}
                />
                <button className="btn-xs btn-primary" onClick={() => handleReview(key)}>
                  Submit Review
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
