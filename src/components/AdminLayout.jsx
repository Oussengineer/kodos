import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <h1>Admin Sign In</h1>
          <p style={{ textAlign: "center", marginBottom: 16, color: "var(--text-muted)" }}>
            Sign in to access the admin panel
          </p>
          <Link to="/login" className="btn-primary" style={{ display: "block" }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <h1>Access Denied</h1>
          <p style={{ textAlign: "center", marginBottom: 16, color: "var(--danger)" }}>
            Admin privileges required
          </p>
          <button className="btn-secondary" onClick={() => { logout(); navigate("/login"); }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/orders", label: "Orders", icon: "📋" },
    { path: "/products", label: "Products", icon: "🍽️" },
    { path: "/restaurants", label: "Vendors", icon: "🏪" },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="admin-logo">Kodos Admin</span>
        <button className="admin-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
          Sign Out
        </button>
      </header>
      <nav className="admin-sidebar">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`admin-sidebar-item ${location.pathname === path ? "active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
