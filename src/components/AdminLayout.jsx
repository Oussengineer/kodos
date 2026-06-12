import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform();

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "restaurant") {
    const navItems = [
      { path: "/", label: "Orders", icon: "📋" },
      { path: "/products", label: "Products", icon: "🍽️" },
    ];

    return (
      <div className="admin-layout">
        <header className="admin-topbar">
          <span className="admin-logo">Kodos {user.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isNative && <a className="download-apk-btn" href="/apk/admin.apk" download>📱 Download APK</a>}
            <button className="admin-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              Sign Out
            </button>
          </div>
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
    { path: "/drivers/new", label: "Drivers", icon: "🚚" },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="admin-logo">Kodos Admin</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isNative && <a className="download-apk-btn" href="/apk/admin.apk" download>📱 Download APK</a>}
          <button className="admin-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
            Sign Out
          </button>
        </div>
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
