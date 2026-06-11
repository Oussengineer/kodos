import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const rating = product.avgRating || product.rating;
  const reviews = product.reviewCount || 0;

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-rating">
            ★ {rating.toFixed(1)} {reviews > 0 && <span style={{ fontSize: ".65rem", color: "var(--text-muted)" }}>({reviews})</span>}
          </span>
        </div>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className="product-time">{product.prepTime} min</span>
          <button className="btn-add" onClick={() => addItem(product)}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
