import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function DriverLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(form.email, form.password);
      if (data.user.role !== "driver") {
        setError(t("driver.login.driversOnly"));
        return;
      }
      setAuth(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || t("driver.login.invalidCredentials"));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{t("driver.login.title")}</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t("driver.login.email")}
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            type="password"
            placeholder={t("driver.login.password")}
            value={form.password}
            onChange={update("password")}
            required
          />
          <button type="submit" className="btn-primary">{t("driver.login.submit")}</button>
        </form>
        <p className="auth-toggle">
          <Link to="/login" className="link-btn">{t("driver.login.customerSignIn")}</Link>
        </p>
      </div>
    </div>
  );
}
