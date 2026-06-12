import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder, getDriverLocation, postReview } from "../api/orders";
import { useAuthStore } from "../store/useAuthStore";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_FLOW = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const user = useAuthStore((s) => s.user);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);

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
    const interval = setInterval(fetchLoc, 1000);
    return () => clearInterval(interval);
  }, [order]);

  // render leaflet map for driver tracking
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
    if (driverPos) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
      } else {
        driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup("Driver");
      }
      mapInstanceRef.current.setView([driverPos.lat, driverPos.lng]);
    }
  }, [driverPos, order]);

  const handleReview = async (productId) => {
    try {
      await postReview(productId, { rating, comment, userName: user?.name || "Customer" });
      setReviewMsg("Review submitted! Thank you.");
      setComment("");
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
          {order.driverPhone && <p>📞 {order.driverPhone}</p>}
          <h3 style={{ marginTop: 12 }}>{driverPos ? "Driver Location" : "Driver is on the way..."}</h3>
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
          {order.items.map((item) => (
            <div key={item.id} style={{ marginBottom: 12, padding: 8, background: "var(--bg)", borderRadius: 8 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "1.3rem", color: star <= rating ? "#f39c12" : "#ddd",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Write a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  border: "1px solid var(--border)", borderRadius: 6,
                  padding: "6px 10px", width: "100%", fontSize: ".85rem",
                  marginBottom: 6, boxSizing: "border-box",
                }}
              />
              <button className="btn-xs btn-primary" onClick={() => handleReview(item.id)}>
                Submit Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
