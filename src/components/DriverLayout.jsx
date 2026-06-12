import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useDriverStore } from "../store/useDriverStore";

const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform();

export default function DriverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const activeCount = useDriverStore((s) => s.activeDeliveries.length);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (user?.role !== "driver") {
      logout();
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated || user?.role !== "driver") return null;

  const nav = [
    { path: "/", label: "Available", icon: "📋" },
    { path: "/active", label: "Active", icon: "🚚", badge: activeCount },
    { path: "/history", label: "History", icon: "📦" },
  ];

  return (
    <div className="app-layout">
      <header className="driver-header">
        <span className="driver-greeting">Hey, {user?.name?.split(" ")[0] || "Driver"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isNative && <a className="download-apk-btn" href="/apk/driver.apk" download>📱 Download APK</a>}
          <button onClick={handleLogout} className="driver-profile-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>🚪</button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {nav.map(({ path, label, icon, badge }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${location.pathname === path ? "active" : ""}`}
          >
            <span className="nav-icon">
              {icon}
              {badge > 0 && <span className="badge">{badge}</span>}
            </span>
            <span className="nav-label">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
