import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminProducts, deleteProduct } from "../../api/admin";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAdminProducts().then(setProducts).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <Link to="/admin" className="back-link">← Dashboard</Link>
        <div className="admin-header-row">
          <h1>Products</h1>
          <Link to="/admin/products/new" className="btn-primary btn-sm">+ Add</Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state"><p>No products yet</p></div>
      ) : (
        <div className="admin-products-list">
          {products.map((p) => (
            <div key={p.id} className="admin-product-card">
              <img src={p.image} alt={p.name} className="admin-product-img" />
              <div className="admin-product-info">
                <h4>{p.name}</h4>
                <p className="admin-product-cat">{p.category}</p>
                <span className="product-price">${p.price.toFixed(2)}</span>
              </div>
              <div className="admin-product-actions">
                <Link to={`/admin/products/edit/${p.id}`} className="btn-secondary btn-xs">Edit</Link>
                <button className="btn-secondary btn-xs btn-danger" onClick={() => handleDelete(p.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
