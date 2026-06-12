import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAdminRestaurants, createRestaurant, updateRestaurant } from "../../api/admin";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [36.8065, 10.1815];

export default function AdminRestaurantForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [form, setForm] = useState({
    name: "", image: "", description: "", type: "restaurant",
    deliveryTime: "", rating: "4.0",
    latitude: "", longitude: "",
    phone: "", address: "", openingHours: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    getAdminRestaurants().then((restaurants) => {
      const r = restaurants.find((x) => x.id === Number(id));
      if (r) setForm({
        name: r.name, image: r.image, description: r.description,
        type: r.type, deliveryTime: r.deliveryTime, rating: String(r.rating),
        latitude: String(r.latitude ?? ""),
        longitude: String(r.longitude ?? ""),
        phone: r.phone || "", address: r.address || "", openingHours: r.openingHours || "",
      });
    }).catch(() => {});
  }, [id, isEdit]);

  // init map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setForm((f) => ({ ...f, latitude: lat.toFixed(5), longitude: lng.toFixed(5) }));
    });

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // update marker when lat/lng change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
      return;
    }
    const pos = [lat, lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos).addTo(map);
    }
    map.setView(pos, map.getZoom());
  }, [form.latitude, form.longitude]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please select a location on the map or enter latitude/longitude.");
      return;
    }
    const payload = {
      ...form,
      rating: Number(form.rating),
      latitude: lat,
      longitude: lng,
    };
    if (isEdit) {
      await updateRestaurant(id, payload);
    } else {
      await createRestaurant(payload);
    }
    navigate("/restaurants");
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/restaurants" className="back-link">← Vendors</Link>
        <h1>{isEdit ? "Edit Vendor" : "Add Vendor"}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={form.name} onChange={update("name")} required />

        <label>Image URL</label>
        <input value={form.image} onChange={update("image")} placeholder="https://..." required />

        <label>Description</label>
        <textarea value={form.description} onChange={update("description")} required rows={3} />

        <label>Type</label>
        <select value={form.type} onChange={update("type")}>
          <option value="restaurant">Restaurant</option>
          <option value="grocery">Grocery</option>
        </select>

        <label>Delivery Time</label>
        <input value={form.deliveryTime} onChange={update("deliveryTime")} placeholder="e.g. 25-35 min" required />

        <label>Rating (0-5)</label>
        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update("rating")} />

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />
        <h3 style={{ marginBottom: 8, fontSize: "1rem" }}>Contact Information</h3>

        <label>Phone</label>
        <input value={form.phone} onChange={update("phone")} placeholder="+216 XX XXX XXX" />

        <label>Address</label>
        <input value={form.address} onChange={update("address")} placeholder="Street, City" />

        <label>Opening Hours</label>
        <input value={form.openingHours} onChange={update("openingHours")} placeholder="e.g. Mon-Sun: 09:00-22:00" />

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />
        <h3 style={{ marginBottom: 8, fontSize: "1rem" }}>Location (click on map or enter coordinates)</h3>

        <label>Latitude</label>
        <input type="number" step="any" value={form.latitude} onChange={update("latitude")} placeholder="e.g. 36.8065" required />

        <label>Longitude</label>
        <input type="number" step="any" value={form.longitude} onChange={update("longitude")} placeholder="e.g. 10.1815" required />

        <div ref={mapRef} style={{ height: 280, borderRadius: 8, marginTop: 8, zIndex: 1 }} />

        <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 8 }}>
          Click on the map to set position. Delivery fee = distance (km) × 300.
        </p>

        <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
          {isEdit ? "Update Vendor" : "Create Vendor"}
        </button>
      </form>
    </div>
  );
}
