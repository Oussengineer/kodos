import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useDriverStore } from "../store/useDriverStore";

export default function DriverLayout() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const activeCount = useDriverStore((s) => s.activeDeliveries.length);

  const nav = [
    { path: "/", label: "Available", icon: "📋" },
    { path: "/active", label: "Active", icon: "🚚", badge: activeCount },
    { path: "/history", label: "History", icon: "📦" },
  ];

  return (
    <div className="app-layout">
      <header className="driver-header">
        <span className="driver-greeting">Hey, {user?.name?.split(" ")[0] || "Driver"}</span>
        <Link to="/login" className="driver-profile-link">👤</Link>
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
