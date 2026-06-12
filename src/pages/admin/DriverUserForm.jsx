import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerDriverUser } from "../../api/admin";

export default function DriverUserForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await registerDriverUser(form);
      setSuccess(t("admin.driverUserForm.success", { name: form.name }));
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      setError(err.response?.data?.error || t("admin.driverUserForm.error"));
    }
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/" className="back-link">{t("admin.driverUserForm.back")}</Link>
        <h1>{t("admin.driverUserForm.title")}</h1>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        {success && <p style={{ color: "var(--success)", marginBottom: 12 }}>{success}</p>}
        <label>{t("admin.driverUserForm.name")}</label>
        <input value={form.name} onChange={update("name")} placeholder={t("admin.driverUserForm.namePlaceholder")} required />
        <label>{t("admin.driverUserForm.email")}</label>
        <input type="email" value={form.email} onChange={update("email")} placeholder={t("admin.driverUserForm.emailPlaceholder")} required />
        <label>{t("admin.driverUserForm.phone")}</label>
        <input type="tel" value={form.phone} onChange={update("phone")} placeholder={t("admin.driverUserForm.phonePlaceholder")} />
        <label>{t("admin.driverUserForm.password")}</label>
        <input type="password" value={form.password} onChange={update("password")} placeholder={t("admin.driverUserForm.passwordPlaceholder")} required />
        <button type="submit" className="btn-primary">{t("admin.driverUserForm.submit")}</button>
      </form>
    </div>
  );
}