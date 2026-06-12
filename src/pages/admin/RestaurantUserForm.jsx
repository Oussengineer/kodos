import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAdminRestaurants, registerRestaurantUser } from "../../api/admin";

export default function RestaurantUserForm() {
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
      setSuccess(`Account created for ${form.name}`);
      setForm({ name: "", email: "", password: "", restaurantId: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    }
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/restaurants" className="back-link">← Vendors</Link>
        <h1>Create Restaurant Account</h1>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="error-msg">{error}</p>}
        {success && <p style={{ color: "var(--success)", marginBottom: 12 }}>{success}</p>}
        <label>Restaurant</label>
        <select value={form.restaurantId} onChange={update("restaurantId")} required>
          <option value="">Select a vendor</option>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <label>Name</label>
        <input value={form.name} onChange={update("name")} placeholder="e.g. Pizza House Staff" required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} placeholder="restaurant@email.com" required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} placeholder="Password" required />
        <button type="submit" className="btn-primary">Create Account</button>
      </form>
    </div>
  );
}
