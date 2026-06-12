import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      alert(t("admin.restaurantForm.selectLocation"));
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
        <Link to="/restaurants" className="back-link">{t("admin.restaurantForm.back")}</Link>
        <h1>{isEdit ? t("admin.restaurantForm.editTitle") : t("admin.restaurantForm.addTitle")}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>{t("admin.restaurantForm.name")}</label>
        <input value={form.name} onChange={update("name")} required />

        <label>{t("admin.restaurantForm.imageUrl")}</label>
        <input value={form.image} onChange={update("image")} placeholder="https://..." required />

        <label>{t("admin.restaurantForm.description")}</label>
        <textarea value={form.description} onChange={update("description")} required rows={3} />

        <label>{t("admin.restaurantForm.type")}</label>
        <select value={form.type} onChange={update("type")}>
          <option value="restaurant">{t("admin.restaurantForm.type_restaurant")}</option>
          <option value="grocery">{t("admin.restaurantForm.type_grocery")}</option>
        </select>

        <label>{t("admin.restaurantForm.deliveryTime")}</label>
        <input value={form.deliveryTime} onChange={update("deliveryTime")} placeholder={t("admin.restaurantForm.deliveryPlaceholder")} required />

        <label>{t("admin.restaurantForm.rating")}</label>
        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update("rating")} />

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />
        <h3 style={{ marginBottom: 8, fontSize: "1rem" }}>{t("admin.restaurantForm.contactInfo")}</h3>

        <label>{t("admin.restaurantForm.phone")}</label>
        <input value={form.phone} onChange={update("phone")} placeholder={t("admin.restaurantForm.phonePlaceholder")} />

        <label>{t("admin.restaurantForm.address")}</label>
        <input value={form.address} onChange={update("address")} placeholder={t("admin.restaurantForm.addressPlaceholder")} />

        <label>{t("admin.restaurantForm.openingHours")}</label>
        <input value={form.openingHours} onChange={update("openingHours")} placeholder={t("admin.restaurantForm.hoursPlaceholder")} />

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />
        <h3 style={{ marginBottom: 8, fontSize: "1rem" }}>{t("admin.restaurantForm.location")}</h3>

        <label>{t("admin.restaurantForm.latitude")}</label>
        <input type="number" step="any" value={form.latitude} onChange={update("latitude")} placeholder={t("admin.restaurantForm.latPlaceholder")} required />

        <label>{t("admin.restaurantForm.longitude")}</label>
        <input type="number" step="any" value={form.longitude} onChange={update("longitude")} placeholder={t("admin.restaurantForm.lngPlaceholder")} required />

        <div ref={mapRef} style={{ height: 280, borderRadius: 8, marginTop: 8, zIndex: 1 }} />

        <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 8 }}>
          {t("admin.restaurantForm.mapHelp")}
        </p>

        <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
          {isEdit ? t("admin.restaurantForm.update") : t("admin.restaurantForm.create")}
        </button>
      </form>
    </div>
  );
}
