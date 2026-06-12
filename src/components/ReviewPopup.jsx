import { useState } from "react";
import { postReview } from "../api/orders";
import { useAuthStore } from "../store/useAuthStore";

const REVIEWED_KEY = "kodos_reviewed_orders";

function getReviewedOrders() {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVIEWED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markReviewed(orderId) {
  const reviewed = getReviewedOrders();
  reviewed.add(orderId);
  localStorage.setItem(REVIEWED_KEY, JSON.stringify([...reviewed]));
}

export function isUnreviewedDelivered(order) {
  if (order.status !== "delivered") return false;
  return !getReviewedOrders().has(order.id);
}

export default function ReviewPopup({ order, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allReviewed = order.items.every((item) => ratings[item.id]);

  const handleSubmit = async (productId) => {
    if (!ratings[productId]) return;
    setSubmitting(true);
    try {
      await postReview(productId, {
        rating: ratings[productId],
        comment: comments[productId] || "",
        userName: user?.name || "Customer",
      });
      setMsg("Review submitted! ✓");
    } catch {
      setMsg("Failed to submit review");
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    markReviewed(order.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content review-popup" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>
        <div className="modal-body">
          <h2 className="modal-title" style={{ fontSize: "1.1rem" }}>Rate Your Order #{order.id}</h2>
          <p style={{ fontSize: ".85rem", color: "var(--text-muted)", marginBottom: 16 }}>
            How was your food? Leave a review for each item.
          </p>

          {msg && <p style={{ color: "var(--success)", marginBottom: 12, fontSize: ".9rem" }}>{msg}</p>}

          {order.items.map((item) => (
            <div key={item.id} className="review-popup-item">
              <div className="review-popup-item-header">
                {item.image && <img src={item.image} alt={item.name} className="review-popup-img" />}
                <div>
                  <p className="review-popup-name">{item.name} × {item.quantity}</p>
                  <p className="review-popup-price">{(item.price * item.quantity).toFixed(2)} TND</p>
                </div>
              </div>

              <div className="review-popup-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatings((prev) => ({ ...prev, [item.id]: star }))}
                    className={`review-star-btn ${star <= (ratings[item.id] || 0) ? "active" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Add a comment (optional)"
                value={comments[item.id] || ""}
                onChange={(e) => setComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="review-popup-input"
              />

              <button
                className="btn-xs btn-primary review-submit-btn"
                onClick={() => handleSubmit(item.id)}
                disabled={!ratings[item.id] || submitting}
              >
                {ratings[item.id] ? "Submit Review" : "Select a rating"}
              </button>
            </div>
          ))}

          <button className="btn-secondary review-skip-btn" onClick={handleClose}>
            {allReviewed ? "Done" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
