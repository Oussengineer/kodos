import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = isRegister
        ? await register(form.name, form.email, form.password, form.phone)
        : await login(form.email, form.password);
      setAuth(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || t("common.error"));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{isRegister ? t("login.createAccount") : t("login.signIn")}</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder={t("login.fullName")}
              value={form.name}
              onChange={update("name")}
              required
            />
          )}
          <input
            type="email"
            placeholder={t("login.email")}
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            type="password"
            placeholder={t("login.password")}
            value={form.password}
            onChange={update("password")}
            required
            minLength={4}
          />
          {isRegister && (
            <input
              type="tel"
              placeholder={t("login.phone")}
              value={form.phone}
              onChange={update("phone")}
            />
          )}
          <button type="submit" className="btn-primary">
            {isRegister ? t("login.register") : t("login.signIn")}
          </button>
        </form>
        <p className="auth-toggle">
          {isRegister ? t("login.alreadyHaveAccount") : t("login.dontHaveAccount")}
          <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? t("login.signInLink") : t("login.registerLink")}
          </button>
        </p>
        <p className="auth-toggle" style={{ marginTop: 8 }}>
          <a href="/driver/login" className="link-btn">{t("login.driverSignIn")}</a>
        </p>
      </div>
    </div>
  );
}
