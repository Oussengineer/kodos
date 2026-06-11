import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="page profile">
        <h1>Profile</h1>
        <div className="empty-state">
          <p>Sign in to manage your profile</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page profile">
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        {user.phone && <p className="profile-phone">{user.phone}</p>}
      </div>
      <div className="profile-actions">
        <Link to="/orders" className="btn-secondary">My Orders</Link>
        <button className="btn-secondary btn-danger" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
