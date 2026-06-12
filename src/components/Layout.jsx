import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../store/useCartStore";
import LanguageSwitcher from "./LanguageSwitcher";

const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform();

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());

  const nav = [
    { path: "/", label: t("nav.home"), icon: "🍽️" },
    { path: "/cart", label: t("nav.cart"), icon: "🛒", badge: itemCount },
    { path: "/orders", label: t("nav.orders"), icon: "📋" },
    { path: "/profile", label: t("nav.profile"), icon: "👤" },
  ];

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-logo">Kodos</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LanguageSwitcher />
          {!isNative && <a className="download-apk-btn" href="/apk/customer.apk" download>📱 Download APK</a>}
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
