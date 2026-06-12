import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.phone);
        setRegisteredEmail(form.email);
        setForm({ name: "", email: "", password: "", phone: "" });
      } else {
        const data = await login(form.email, form.password);
        setAuth(data.user, data.token);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (registeredEmail) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <h1>Check Your Email</h1>
          <p style={{ textAlign: "center", lineHeight: 1.6, margin: "16px 0" }}>
            We sent a verification link to <strong>{registeredEmail}</strong>.
            Click the link to activate your account, then sign in.
          </p>
          <button className="btn-primary" onClick={() => setRegisteredEmail("")}>
            Got it, sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{isRegister ? "Create Account" : "Sign In"}</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={update("name")}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={4}
          />
          {isRegister && (
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={update("phone")}
            />
          )}
          <button type="submit" className="btn-primary">
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>
        <p className="auth-toggle">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
        <p className="auth-toggle" style={{ marginTop: 8 }}>
          <a href="/driver/login" className="link-btn">Are you a driver? Sign in here</a>
        </p>
      </div>
    </div>
  );
}
