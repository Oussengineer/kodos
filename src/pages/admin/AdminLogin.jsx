import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminLogin() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(form.email, form.password);
      if (data.user.role !== "admin" && data.user.role !== "restaurant") {
        setError(t("admin.login.accessDenied"));
        return;
      }
      setAuth(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || t("admin.login.invalidCredentials"));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{t("admin.login.title")}</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t("admin.login.email")}
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            type="password"
            placeholder={t("admin.login.password")}
            value={form.password}
            onChange={update("password")}
            required
          />
          <button type="submit" className="btn-primary">{t("admin.login.submit")}</button>
        </form>
      </div>
    </div>
  );
}
