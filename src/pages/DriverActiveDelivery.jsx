import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getActiveDeliveries, updateDeliveryStatus, updateDriverLocation } from "../api/driver";
import { useDriverStore } from "../store/useDriverStore";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function DriverActiveDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const setActiveDeliveries = useDriverStore((s) => s.setActiveDeliveries);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const destMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  const fetchActive = useCallback(() => {
    getActiveDeliveries()
      .then((data) => {
        setDeliveries(data);
        setActiveDeliveries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setActiveDeliveries]);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  // GPS tracking
  useEffect(() => {
    if (deliveries.length === 0) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const orderIds = deliveries.map((o) => o.id);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverPos({ lat: latitude, lng: longitude });
        for (const orderId of orderIds) {
          updateDriverLocation(latitude, longitude, orderId).catch(() => {});
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [deliveries]);

  // map for first delivery destination + driver position
  useEffect(() => {
    const first = deliveries[0];
    if (!first || !first.latitude || !first.longitude) return;
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([first.latitude, first.longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    if (destMarkerRef.current) destMarkerRef.current.setLatLng([first.latitude, first.longitude]);
    else {
      destMarkerRef.current = L.marker([first.latitude, first.longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`Delivery: ${first.address}`);
    }
  }, [deliveries]);

  // update driver marker on the map when GPS updates
  useEffect(() => {
    if (!driverPos || !mapInstanceRef.current) return;
    if (driverMarkerRef.current) driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    else {
      driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], {
        icon: L.divIcon({
          className: "",
          html: '<div style="background:#3498db;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.3)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(mapInstanceRef.current).bindPopup("You");
    }
    // fit both markers
    const first = deliveries[0];
    if (first && first.latitude && first.longitude) {
      mapInstanceRef.current.fitBounds([
        [driverPos.lat, driverPos.lng],
        [first.latitude, first.longitude],
      ], { padding: [50, 50] });
    }
  }, [driverPos, deliveries]);

  const handleDelivered = async (id) => {
    setUpdating(id);
    try {
      await updateDeliveryStatus(id, "delivered");
      fetchActive();
    } catch {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state"><p>Loading active deliveries...</p></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="page">
        <h2>Active Deliveries</h2>
        <div className="empty-state">
          <p>No active deliveries</p>
          <Link to="/driver" className="btn-primary">Find Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page driver-active">
      <h2>Active Deliveries</h2>
      <p className="subtitle">{deliveries.length} delivery in progress</p>

      {/* destination map */}
      {deliveries[0]?.latitude && deliveries[0]?.longitude && (
        <div className="order-section">
          <h3>Delivery Destination</h3>
          <div ref={mapRef} style={{ height: 200, borderRadius: 8, zIndex: 1 }} />
        </div>
      )}

      <div className="driver-orders-list">
        {deliveries.map((order) => (
          <div key={order.id} className="driver-order-card active-card">
            <div className="driver-order-top">
              <span className="driver-customer">{order.customerName}</span>
              <span className="driver-status-badge" style={{ background: "#cce5ff", color: "#004085" }}>
                Out for Delivery
              </span>
            </div>

            <p className="driver-order-items">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
            </p>

            <div className="driver-order-meta">
              <span>📍 {order.address}</span>
              <span className="driver-order-total">${order.total.toFixed(2)}</span>
            </div>

            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="driver-call-btn">
                📞 Call {order.customerName}
              </a>
            )}

            <button
              className="btn-primary"
              style={{ background: "var(--success)" }}
              onClick={() => handleDelivered(order.id)}
              disabled={updating === order.id}
            >
              {updating === order.id ? "Updating..." : "✓ Mark as Delivered"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
