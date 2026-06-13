import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "../../api/admin";

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    getAdminUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (u) => {
    setEditing(u.id);
    setForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role });
    setError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({});
    setError("");
  };

  const saveEdit = async () => {
    try {
      const updated = await updateAdminUser(editing, form);
      setUsers((prev) => prev.map((u) => (u.id === editing ? updated : u)));
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.error || t("common.error"));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t("admin.users.deleteConfirm", { name }))) return;
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || t("common.error"));
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading) {
    return <div className="page admin-page"><p>{t("common.loading")}</p></div>;
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>{t("admin.users.title")}</h1>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {users.length === 0 ? (
        <p>{t("admin.users.noUsers")}</p>
      ) : (
        <div className="admin-products-list">
          {users.map((u) => (
            <div key={u.id} className="admin-product-card">
              <div className="admin-product-info">
                <h4>{u.name}</h4>
                <p className="admin-product-cat">{u.email} — {t(`admin.users.role_${u.role}`)}</p>
                {u.phone && <p className="admin-product-cat">{t("admin.users.phone")}: {u.phone}</p>}
              </div>
              <div className="admin-product-actions">
                <button className="btn-xs btn-primary" onClick={() => startEdit(u)}>{t("common.edit")}</button>
                <button className="btn-xs btn-secondary" style={{ color: "var(--danger)" }} onClick={() => handleDelete(u.id, u.name)} disabled={u.role === "admin"}>{t("common.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 16 }}>{t("admin.users.editTitle")}</h2>
            <div className="admin-form">
              <label>{t("admin.users.name")}</label>
              <input value={form.name} onChange={update("name")} />
              <label>{t("admin.users.email")}</label>
              <input value={form.email} onChange={update("email")} />
              <label>{t("admin.users.phone")}</label>
              <input value={form.phone} onChange={update("phone")} placeholder={t("admin.users.phonePlaceholder")} />
              <label>{t("admin.users.role")}</label>
              <select value={form.role} onChange={update("role")}>
                <option value="customer">{t("admin.users.role_customer")}</option>
                <option value="driver">{t("admin.users.role_driver")}</option>
                <option value="restaurant">{t("admin.users.role_restaurant")}</option>
                <option value="admin">{t("admin.users.role_admin")}</option>
              </select>
              <label>{t("admin.users.newPassword")}</label>
              <input type="password" value={form.password || ""} onChange={update("password")} placeholder={t("admin.users.passwordPlaceholder")} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={saveEdit}>{t("common.save")}</button>
                <button className="btn-secondary" onClick={cancelEdit}>{t("common.cancel")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}