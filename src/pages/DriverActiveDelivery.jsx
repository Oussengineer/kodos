import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getActiveDeliveries, updateDeliveryStatus, updateDriverLocation } from "../api/driver";
import { useDriverStore } from "../store/useDriverStore";
import { useTranslation } from "react-i18next";
import "../utils/leafletIcons";
import L from "leaflet";

export default function DriverActiveDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const setActiveDeliveries = useDriverStore((s) => s.setActiveDeliveries);
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const destMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const watchIdRef = useRef(null);
  const { t } = useTranslation();

  const fetchActive = useCallback(async () => {
    try {
      const data = await getActiveDeliveries();
      setDeliveries(data);
      setActiveDeliveries(data);
    } catch {} finally {
      setLoading(false);
      setUpdating(null);
    }
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

  // fetch route from OSRM — debounced to avoid excessive API calls
  useEffect(() => {
    if (!driverPos || !deliveries[0]?.latitude || !deliveries[0]?.longitude) return;
    const timer = setTimeout(() => {
      const destLat = deliveries[0].latitude;
      const destLng = deliveries[0].longitude;
      const url = `https://router.project-osrm.org/route/v1/driving/${driverPos.lng},${driverPos.lat};${destLng},${destLat}?geometries=geojson&overview=full`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (!data.routes?.[0]) return;
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteInfo({ distance: route.distance, duration: route.duration });

          const map = mapInstanceRef.current;
          if (!map) return;
          if (routeLineRef.current) map.removeLayer(routeLineRef.current);
          routeLineRef.current = L.polyline(coords, {
            color: "#3498db", weight: 4, opacity: 0.7,
          }).addTo(map);
        })
        .catch(() => {});
    }, 30000);
    return () => clearTimeout(timer);
  }, [driverPos, deliveries]);

  const handleDelivered = async (id) => {
    setUpdating(id);
    try {
      await updateDeliveryStatus(id, "delivered");
      await fetchActive();
    } catch {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state"><p>{t("driver.activeDelivery.loading")}</p></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="page">
        <h2>{t("driver.activeDelivery.title")}</h2>
        <div className="empty-state">
          <p>{t("driver.activeDelivery.noDeliveries")}</p>
          <Link to="/" className="btn-primary">{t("driver.activeDelivery.findOrders")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page driver-active">
      <h2>{t("driver.activeDelivery.title")}</h2>
      <p className="subtitle">{t("driver.activeDelivery.inProgress", { count: deliveries.length })}</p>
      {routeInfo && (
        <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: 8 }}>
          🗺️ {(routeInfo.distance / 1000).toFixed(1)} km · {Math.round(routeInfo.duration / 60)} min
        </p>
      )}

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
                {t("driver.activeDelivery.outForDelivery")}
              </span>
            </div>

            <p className="driver-order-items">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
            </p>

            <div className="driver-order-meta">
              <span>📍 {order.address}</span>
              <span className="driver-order-total">{order.total.toFixed(2)} TND</span>
            </div>

            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="driver-call-btn">
                {t("driver.activeDelivery.call", { name: order.customerName })}
              </a>
            )}

            <button
              className="btn-primary"
              style={{ background: "var(--success)" }}
              onClick={() => handleDelivered(order.id)}
              disabled={updating === order.id}
            >
              {updating === order.id ? t("driver.activeDelivery.updating") : t("driver.activeDelivery.markDelivered")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
