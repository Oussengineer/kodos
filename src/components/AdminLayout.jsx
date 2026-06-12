import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import LanguageSwitcher from "./LanguageSwitcher";

const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform();

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "restaurant") {
    const navItems = [
      { path: "/", label: t("admin.layout.orders"), icon: "📋" },
      { path: "/products", label: t("admin.layout.products"), icon: "🍽️" },
    ];

    return (
      <div className="admin-layout">
        <header className="admin-topbar">
          <span className="admin-logo">Kodos {user.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitcher />
            {!isNative && <a className="download-apk-btn" href="/apk/admin.apk" download>📱 Download APK</a>}
            <button className="admin-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              {t("admin.layout.signOut")}
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
          <h1>{t("admin.layout.accessDenied")}</h1>
          <p style={{ textAlign: "center", marginBottom: 16, color: "var(--danger)" }}>
            {t("admin.layout.adminRequired")}
          </p>
          <button className="btn-secondary" onClick={() => { logout(); navigate("/login"); }}>
            {t("admin.layout.signOut")}
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", label: t("admin.layout.dashboard"), icon: "📊" },
    { path: "/orders", label: t("admin.layout.orders"), icon: "📋" },
    { path: "/products", label: t("admin.layout.products"), icon: "🍽️" },
    { path: "/restaurants", label: t("admin.layout.vendors"), icon: "🏪" },
    { path: "/drivers/new", label: t("admin.layout.drivers"), icon: "🚚" },
  ];

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="admin-logo">{t("admin.layout.kodosAdmin")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LanguageSwitcher />
          {!isNative && <a className="download-apk-btn" href="/apk/admin.apk" download>📱 Download APK</a>}
          <button className="admin-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
            {t("admin.layout.signOut")}
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
