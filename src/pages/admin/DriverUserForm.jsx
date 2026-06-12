import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerDriverUser } from "../../api/admin";

export default function DriverUserForm() {
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
      setSuccess(`Driver account created for ${form.name}`);
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    }
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/" className="back-link">← Dashboard</Link>
        <h1>Create Driver Account</h1>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        {success && <p style={{ color: "var(--success)", marginBottom: 12 }}>{success}</p>}
        <label>Name</label>
        <input value={form.name} onChange={update("name")} placeholder="e.g. John Driver" required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} placeholder="driver@email.com" required />
        <label>Phone</label>
        <input type="tel" value={form.phone} onChange={update("phone")} placeholder="+216 XX XXX XXX" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} placeholder="Password" required />
        <button type="submit" className="btn-primary">Create Account</button>
      </form>
    </div>
  );
}