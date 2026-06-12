import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../store/useCartStore";
import { getProductReviews } from "../api/products";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const rating = product.avgRating ?? product.rating ?? 0;
  const reviews = product.reviewCount || 0;
  const [showModal, setShowModal] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (showModal && product.id) {
      setLoadingReviews(true);
      getProductReviews(product.id)
        .then(setReviewsList)
        .catch(() => setReviewsList([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [showModal, product.id]);

  return (
    <>
      <div className="product-card" onClick={() => setShowModal(true)}>
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
            <span className="product-price">{product.price.toFixed(2)} {t("common.currency")}</span>
            <span className="product-time">{product.prepTime} min</span>
            <button className="btn-add" onClick={(e) => { e.stopPropagation(); addItem(product); }}>
              {t("productCard.add")}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <img src={product.image} alt={product.name} className="modal-image" />
            <div className="modal-body">
              <h2 className="modal-title">{product.name}</h2>
              <div className="modal-meta">
                <span className="modal-rating">★ {rating.toFixed(1)}</span>
                <span className="modal-price">{product.price.toFixed(2)} {t("common.currency")}</span>
                <span className="modal-time">{product.prepTime} min</span>
              </div>
              <p className="modal-desc">{product.description}</p>

              <h3 className="modal-reviews-header">
                {t("orderDetail.items")} ({reviewsList.length})
              </h3>
              <div className="modal-reviews">
                {loadingReviews ? (
                  <p className="modal-loading">{t("common.loading")}</p>
                ) : reviewsList.length === 0 ? (
                  <p className="modal-no-reviews">{t("common.noResults")}</p>
                ) : (
                  reviewsList.map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="review-top">
                        <span className="review-author">{r.userName}</span>
                        <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      {r.comment && <p className="review-comment">{r.comment}</p>}
                      <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
