import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { placeOrder } from "../api/orders";
import CartItem from "../components/CartItem";
import L from "leaflet";

// Fix default marker icon for Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Cart() {
  const { items, getTotal, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const name = useAuthStore((s) => s.user?.name || "");
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [placing, setPlacing] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const defaultLat = 36.8065, defaultLng = 10.1815;
      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapInstanceRef.current = map;

      // try auto-detect position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            map.setView([latitude, longitude], 15);
            markerRef.current = L.marker([latitude, longitude]).addTo(map);
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
              .then((r) => r.json())
              .then((data) => { if (data.display_name) setAddress(data.display_name); })
              .catch(() => {});
          },
          () => {
            // fallback: let user click on map
            map.setView([defaultLat, defaultLng], 13);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng]).addTo(map);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((r) => r.json())
          .then((data) => { if (data.display_name) setAddress(data.display_name); })
          .catch(() => {});
      });
    }
  }, []);

  const handleCheckout = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (!address.trim()) return alert("Please select a delivery location on the map");
    setPlacing(true);
    try {
      await placeOrder({ items, address, total: getTotal(), latitude, longitude });
      clearCart();
      navigate("/orders");
    } catch {
      alert("Failed to place order. Is the server running?");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page cart">
        <h1>Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <p style={{ fontSize: ".85rem", color: "var(--text-muted)", marginBottom: 8 }}>
          Click on the map to choose your delivery location
        </p>
        <div ref={mapRef} style={{ height: 200, borderRadius: 8, marginBottom: 12, zIndex: 1 }} />
        <input
          type="text"
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="address-input"
        />
        <button className="btn-primary" onClick={handleCheckout} disabled={placing}>
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
