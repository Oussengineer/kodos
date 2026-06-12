import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAdminProducts, createProduct, updateProduct, getAdminRestaurants } from "../../api/admin";

const CATEGORIES = ["Pizza", "Burgers", "Sushi", "Salads", "Noodles", "Desserts", "Drinks", "Dairy", "Bakery", "Fruits"];

export default function AdminProductForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "Pizza",
    image: "", rating: "4.0", prepTime: "", type: "food", restaurantId: 1,
  });

  useEffect(() => {
    getAdminRestaurants().then(setRestaurants).catch(() => {});
    if (!isEdit) return;
    getAdminProducts().then((products) => {
      const p = products.find((x) => x.id === Number(id));
      if (p) setForm({ ...p, price: String(p.price), rating: String(p.rating), prepTime: String(p.prepTime) });
    }).catch(() => {});
  }, [id, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
      prepTime: Number(form.prepTime),
      restaurantId: Number(form.restaurantId),
    };
    if (isEdit) {
      await updateProduct(id, payload);
    } else {
      await createProduct(payload);
    }
    navigate("/products");
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/products" className="back-link">{t("admin.productForm.back")}</Link>
        <h1>{isEdit ? t("admin.productForm.editTitle") : t("admin.productForm.addTitle")}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>{t("admin.productForm.name")}</label>
        <input value={form.name} onChange={update("name")} required />

        <label>{t("admin.productForm.description")}</label>
        <textarea value={form.description} onChange={update("description")} required rows={3} />

        <label>{t("admin.productForm.price")}</label>
        <input type="number" step="0.01" min="0" value={form.price} onChange={update("price")} required />

        <label>{t("admin.productForm.type")}</label>
        <select value={form.type} onChange={update("type")}>
          <option value="food">{t("admin.productForm.type_food")}</option>
          <option value="grocery">{t("admin.productForm.type_grocery")}</option>
        </select>

        <label>{t("admin.productForm.vendor")}</label>
        <select value={form.restaurantId} onChange={update("restaurantId")}>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
        </select>

        <label>{t("admin.productForm.category")}</label>
        <select value={form.category} onChange={update("category")}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>{t("admin.productForm.imageUrl")}</label>
        <input value={form.image} onChange={update("image")} placeholder={t("admin.productForm.imagePlaceholder")} required />

        <label>{t("admin.productForm.rating")}</label>
        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update("rating")} />

        <label>{t("admin.productForm.prepTime")}</label>
        <input type="number" min="1" value={form.prepTime} onChange={update("prepTime")} required />

        <button type="submit" className="btn-primary">
          {isEdit ? t("admin.productForm.update") : t("admin.productForm.create")}
        </button>
      </form>
    </div>
  );
}
