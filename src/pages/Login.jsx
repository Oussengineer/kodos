import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";
import client from "../api/client";

export default function Login() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      try {
        const resp = await client.post("/verify/send", { phone: form.phone });
        const data = resp.data;
        if (data.mock) setVerifyMsg(data.message);
        setVerifyingPhone(form.phone);
        setVerifying(true);
        setVerifyCode("");
      } catch (err) {
        setError(err.response?.data?.error || t("common.error"));
      }
    } else {
      try {
        const data = await login(form.email, form.password);
        setAuth(data.user, data.token);
        navigate("/");
      } catch (err) {
        setError(err.response?.data?.error || t("common.error"));
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const resp = await client.post("/verify/verify", { phone: verifyingPhone, code: verifyCode });
      if (resp.data.verified) {
        const data = await register(form.name, form.email, form.password, form.phone);
        setAuth(data.user, data.token);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || t("common.error"));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (verifying) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <h1>{t("login.verifyPhone")}</h1>
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 16 }}>
            {t("login.verifySent")} <strong>{verifyingPhone}</strong>
          </p>
          {verifyMsg && <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".85rem", marginBottom: 12 }}>{verifyMsg}</p>}
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleVerify}>
            <input
              type="text"
              inputMode="numeric"
              placeholder={t("login.verifyCode")}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              required
              maxLength={6}
              autoFocus
            />
            <button type="submit" className="btn-primary">
              {t("login.verifySubmit")}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              required
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
