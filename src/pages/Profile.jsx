import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="page profile">
        <h1>{t("profile.title")}</h1>
        <div className="empty-state">
          <p>{t("profile.signInToManage")}</p>
          <Link to="/login" className="btn-primary">{t("profile.signIn")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page profile">
      <h1>{t("profile.title")}</h1>
      <div className="profile-card">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        {user.phone && <p className="profile-phone">{user.phone}</p>}
      </div>
      <div className="profile-actions">
        <Link to="/orders" className="btn-secondary">{t("profile.myOrders")}</Link>
        <button className="btn-secondary btn-danger" onClick={handleLogout}>
          {t("profile.signOut")}
        </button>
      </div>
    </div>
  );
}
