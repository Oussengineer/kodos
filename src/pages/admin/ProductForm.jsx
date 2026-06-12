import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAdminProducts, createProduct, updateProduct, getAdminRestaurants } from "../../api/admin";

const CATEGORIES = ["Pizza", "Burgers", "Sushi", "Salads", "Noodles", "Desserts", "Drinks", "Dairy", "Bakery", "Fruits"];

export default function AdminProductForm() {
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
        <Link to="/products" className="back-link">← Products</Link>
        <h1>{isEdit ? "Edit Product" : "Add Product"}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={form.name} onChange={update("name")} required />

        <label>Description</label>
        <textarea value={form.description} onChange={update("description")} required rows={3} />

        <label>Price (TND)</label>
        <input type="number" step="0.01" min="0" value={form.price} onChange={update("price")} required />

        <label>Type</label>
        <select value={form.type} onChange={update("type")}>
          <option value="food">Food</option>
          <option value="grocery">Grocery</option>
        </select>

        <label>Vendor</label>
        <select value={form.restaurantId} onChange={update("restaurantId")}>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
        </select>

        <label>Category</label>
        <select value={form.category} onChange={update("category")}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Image URL</label>
        <input value={form.image} onChange={update("image")} placeholder="https://..." required />

        <label>Rating (0-5)</label>
        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update("rating")} />

        <label>Prep Time (min)</label>
        <input type="number" min="1" value={form.prepTime} onChange={update("prepTime")} required />

        <button type="submit" className="btn-primary">
          {isEdit ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
}
