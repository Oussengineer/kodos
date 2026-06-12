import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAdminRestaurants, registerRestaurantUser } from "../../api/admin";

export default function RestaurantUserForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", restaurantId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAdminRestaurants().then(setRestaurants).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await registerRestaurantUser(form);
      setSuccess(t("admin.restaurantUserForm.success", { name: form.name }));
      setForm({ name: "", email: "", password: "", restaurantId: "" });
    } catch (err) {
      setError(err.response?.data?.error || t("admin.restaurantUserForm.error"));
    }
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/restaurants" className="back-link">{t("admin.restaurantUserForm.back")}</Link>
        <h1>{t("admin.restaurantUserForm.title")}</h1>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        {success && <p style={{ color: "var(--success)", marginBottom: 12 }}>{success}</p>}
        <label>{t("admin.restaurantUserForm.restaurant")}</label>
        <select value={form.restaurantId} onChange={update("restaurantId")} required>
          <option value="">{t("admin.restaurantUserForm.selectVendor")}</option>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <label>{t("admin.restaurantUserForm.name")}</label>
        <input value={form.name} onChange={update("name")} placeholder={t("admin.restaurantUserForm.namePlaceholder")} required />
        <label>{t("admin.restaurantUserForm.email")}</label>
        <input type="email" value={form.email} onChange={update("email")} placeholder={t("admin.restaurantUserForm.emailPlaceholder")} required />
        <label>{t("admin.restaurantUserForm.password")}</label>
        <input type="password" value={form.password} onChange={update("password")} placeholder={t("admin.restaurantUserForm.passwordPlaceholder")} required />
        <button type="submit" className="btn-primary">{t("admin.restaurantUserForm.submit")}</button>
      </form>
    </div>
  );
}
