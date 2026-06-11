import { Outlet, Link, useLocation } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Layout() {
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const nav = [
    { path: "/", label: "Menu", icon: "🍽️" },
    { path: "/cart", label: "Cart", icon: "🛒", badge: itemCount },
    { path: "/orders", label: "Orders", icon: "📋" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="app-layout">
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
